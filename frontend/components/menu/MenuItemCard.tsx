import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  onAdd,
}: MenuItemCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md sm:flex-row">
      {/* Image placeholder */}
      <div className="flex h-48 w-full shrink-0 items-center justify-center bg-orange-50 sm:h-auto sm:w-40">
        <span className="text-5xl">🍛</span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">
              {item.name}
            </h3>

            <span className="shrink-0 font-bold text-orange-600">
              £{item.price.toFixed(2)}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {item.description}
          </p>
        </div>

        <button
            type="button"
            onClick={() => onAdd(item)}
            className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 active:scale-[0.98] sm:w-fit"
            >
            + Add to basket
            </button>
      </div>
    </article>
  );
}