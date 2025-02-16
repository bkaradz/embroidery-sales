import { Checkbox } from "$lib/components/ui/checkbox";
import { renderComponent } from "$lib/components/ui/data-table/index";
import type { Customers } from "$lib/server/db/schema/schema";
import type { ColumnDef } from "@tanstack/table-core";
import DataTableActions from "./data-table-actions.svelte";
import DataTableButton from "./data-table-button.svelte";


export const columns: ColumnDef<Customers>[] = [
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
    accessorKey: "fullName",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Full Name",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Phone",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "email",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Email",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "address",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Address",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "notes",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Notes",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "isCorporate",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Corporate",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id.toString() });
    },
  },

];
