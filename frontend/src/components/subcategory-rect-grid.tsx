import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export type SubcategoryRectItem = {
  name: string;
  image: string;
  to?: string;
};

export function SubcategoryRectGrid({
  items,
  className,
}: {
  items: SubcategoryRectItem[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => {
        const content = (
          <article className="relative h-28 w-full overflow-hidden rounded-lg border shadow-sm sm:h-32">
            <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
            <div className="relative flex h-full items-center px-5">
              <h3 className="text-base font-semibold text-white sm:text-lg">{item.name}</h3>
            </div>
          </article>
        );

        if (!item.to) {
          return <div key={item.name}>{content}</div>;
        }

        return (
          <Link
            key={item.name}
            to={item.to}
            className="block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
