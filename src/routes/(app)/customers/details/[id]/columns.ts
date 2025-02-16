import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index";
import DataTableActions from "./data-table-actions.svelte";
import DataTableButton from "./data-table-button.svelte";
import { Checkbox } from "$lib/components/ui/checkbox";
import type { Orders } from "$lib/server/db/schema/schema";
import { format } from "date-fns";


export const columns: ColumnDef<Orders>[] = [
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
    accessorKey: "orderDate",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Order Date",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
    cell: ({ row }) => {
      const amountCellSnippet = createRawSnippet<[string]>((getDate) => {
        const date = getDate();
        return {
          render: () => `<div class="text-center">${date}</div>`
        };
      });
      const formatter = format(new Date(row.getValue("orderDate")), 'yyyy-MM-dd HH:mm:ss')

      return renderSnippet(
        amountCellSnippet,
        formatter
      );
    }
  },
  {
    accessorKey: "totalAmount",
    header: () => {
      const amountHeaderSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-right">Total Amount</div>`
        };
      });
      return renderSnippet(amountHeaderSnippet, "");
    },
    cell: ({ row }) => {
      const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
        const amount = getAmount();
        return {
          render: () => `<div class="text-right">${amount}</div>`
        };
      });
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      });

      return renderSnippet(
        amountCellSnippet,
        formatter.format(Number.parseFloat(row.getValue("totalAmount")))
      );
    }
  },
  {
    accessorKey: "totalPaid",
    header: () => {
      const amountHeaderSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-right">Total Paid</div>`
        };
      });
      return renderSnippet(amountHeaderSnippet, "");
    },
    cell: ({ row }) => {
      const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
        const amount = getAmount();
        return {
          render: () => `<div class="text-right">${amount}</div>`
        };
      });
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      });

      return renderSnippet(
        amountCellSnippet,
        formatter.format(Number.parseFloat(row.getValue("totalPaid")))
      );
    }
  },
  {
    accessorKey: "balanceRemaining",
    header: () => {
      const amountHeaderSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-right">Balance</div>`
        };
      });
      return renderSnippet(amountHeaderSnippet, "");
    },
    cell: ({ row }) => {
      const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
        const amount = getAmount();
        return {
          render: () => `<div class="text-right">${amount}</div>`
        };
      });
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      });

      return renderSnippet(
        amountCellSnippet,
        formatter.format(Number.parseFloat(row.getValue("balanceRemaining")))
      );
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Status",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Pay Status",
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