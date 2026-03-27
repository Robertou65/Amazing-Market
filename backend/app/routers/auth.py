from fastapi import APIRouter, HTTPException, status, Depends
from app.models import UserCreate, UserLogin, Token, UserResponse
from app.database import get_db_connection
from app.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from mysql.connector import IntegrityError

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            # Hash the password
            hashed_password = hash_password(user_data.password)
            
            # Insert user into database
            cursor.execute(
                """
                INSERT INTO users (username, email, phone, password, birthdate)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    user_data.username,
                    user_data.email,
                    user_data.phone,
                    hashed_password,
                    user_data.birthdate.isoformat(),
                ),
            )
            connection.commit()
            user_id = cursor.lastrowid
            
            # Get the created user
            cursor.execute(
                "SELECT id, username, email, phone, birthdate FROM users WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
            cursor.close()
            
            # Create access token
            access_token = create_access_token(data={"sub": str(user["id"])})
            
            return Token(
                access_token=access_token,
                user=UserResponse(**user)
            )
        
    except IntegrityError as e:
        error_msg = str(e)
        if "username" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está en uso"
            )
        elif "email" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado"
            )
        elif "phone" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de teléfono ya está registrado"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al registrar el usuario"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login with email and password"""
    
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            # Get user by email
            cursor.execute(
                "SELECT id, username, email, phone, birthdate, password FROM users WHERE email = %s",
                (credentials.email,)
            )
            user = cursor.fetchone()
            cursor.close()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Correo o contraseña incorrectos"
                )
            
            # Verify password
            if not verify_password(credentials.password, user["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Correo o contraseña incorrectos"
                )
            
            # Create access token
            access_token = create_access_token(data={"sub": str(user["id"])})
            
            # Remove password from response
            user.pop("password")
            
            return Token(
                access_token=access_token,
                user=UserResponse(**user)
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
