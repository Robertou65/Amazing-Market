const AUTH_KEY = "amazing-market:is-logged";

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function setLoggedIn(value: boolean): void {
  localStorage.setItem(AUTH_KEY, value ? "true" : "false");
}
