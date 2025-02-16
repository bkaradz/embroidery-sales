import { Checkbox } from "$lib/components/ui/checkbox";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index";
import type { NewProduct } from "$lib/utility/schemas";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import DataTableButton from "./data-table-button.svelte";


export const getColumn = () => {
  return [
    {
      id: "select",
      header: ({ table }) =>
        renderComponent(Checkbox, {
          checked: table.getIsAllPageRowsSelected(),
          indeterminate:
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected(),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all",
        }),
      cell: ({ row }) =>
        renderComponent(Checkbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID"
    },
    {
      accessorKey: "name",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Name",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "stitches",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Stitches",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "productCategory",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Product Category",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "basePrice",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Base Price</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });

        const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
          const basePrice = getAmount();
          if (basePrice === "$NaN") {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${basePrice}</div>`,
          };
        });

        return renderSnippet(
          amountCellSnippet,
          formatter.format(parseFloat(row.getValue("basePrice")))
        );
      },
    },
  ] as ColumnDef<NewProduct>[]
}