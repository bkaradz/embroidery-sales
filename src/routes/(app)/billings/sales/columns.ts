import { Checkbox } from "$lib/components/ui/checkbox";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index";
import type { GetSalesBookResult } from "$lib/server/routes/orders";
import { formatCurrency } from "$lib/utility/convert-currencies";
import type { Converter } from "$lib/utility/schemas";
import type { ColumnDef } from "@tanstack/table-core";
import { format } from "date-fns";
import { createRawSnippet } from "svelte";
import DataTableButton from "./data-table-button.svelte";


export const getColumn = (viewCurrency: () => string, converter: Converter) => {
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
      accessorKey: "orderDate",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Order Date</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {


        const amountCellSnippet = createRawSnippet<[string]>((getDate) => {
          const date = getDate();
          if (typeof date !== 'string') {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${date}</div>`,
          };
        });

        return renderSnippet(
          amountCellSnippet,
          format(new Date(row.getValue("orderDate")), 'dd/MM/yyyy')
        );
      },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Customer",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "productName",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Product",
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
      accessorKey: "quantity",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Quantity",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "unitPrice",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Unit Price</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {

        const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
          const unitPrice = getAmount();
          if (unitPrice === "NaN") {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${unitPrice}</div>`,
          };
        });

        let value

        if (row.getValue("unitPrice") === null) {
          value = "NaN"
        } else {
          value = formatCurrency(converter, row.getValue("unitPrice"), { to: viewCurrency() })
        }

        return renderSnippet(
          amountCellSnippet,
          value
        );
      },
    },
    {
      accessorKey: "total",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Total</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {

        const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
          const total = getAmount();
          if (total === "NaN") {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${total}</div>`,
          };
        });

        let value

        if (row.getValue("total") === null) {
          value = "NaN"
        } else {
          value = formatCurrency(converter, row.getValue("total"), { to: viewCurrency() })
        }

        return renderSnippet(
          amountCellSnippet,
          value
        );
      },
    },
    {
      accessorKey: "orderStatus",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Order Status",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Payments",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },
    {
      accessorKey: "status",
      header: ({ column }) => renderComponent(DataTableButton, {
        name: "Status",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    },

    {
      accessorKey: "orderTotal",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Order Total</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {

        const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
          const orderTotal = getAmount();
          if (orderTotal === "NaN") {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${orderTotal}</div>`,
          };
        });

        let value

        if (row.getValue("orderTotal") === null) {
          value = "NaN"
        } else {
          value = formatCurrency(converter, row.getValue("orderTotal"), { to: viewCurrency() })
        }

        return renderSnippet(
          amountCellSnippet,
          value
        );
      },
    },
    {
      accessorKey: "totalPaid",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Total Paid</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {

        const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
          const totalPaid = getAmount();
          if (totalPaid === "NaN") {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${totalPaid}</div>`,
          };
        });

        let value

        if (row.getValue("totalPaid") === null) {
          value = "NaN"
        } else {

          value = formatCurrency(converter, row.getValue("totalPaid"), { to: viewCurrency() })
        }

        return renderSnippet(
          amountCellSnippet,
          value
        );
      },
    },
    {
      accessorKey: "balanceRemaining",
      header: () => {
        const amountHeaderSnippet = createRawSnippet(() => ({
          render: () => `<div class="text-right">Balance Remaining</div>`,
        }));
        return renderSnippet(amountHeaderSnippet, "");
      },
      cell: ({ row }) => {

        const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
          const balanceRemaining = getAmount();
          if (balanceRemaining === "NaN") {
            return {
              render: () => `<div class="text-right font-medium"></div>`,
            };
          }
          return {
            render: () => `<div class="text-right font-medium">${balanceRemaining}</div>`,
          };
        });

        let value

        if (row.getValue("balanceRemaining") === null) {
          value = "NaN"
        } else {
          value = formatCurrency(converter, row.getValue("balanceRemaining"), { to: viewCurrency() })
        }

        return renderSnippet(
          amountCellSnippet,
          value
        );
      },
    },
    // {
    //   accessorKey: "id",
    //   header: "ID"
    // },
    // {
    //   id: "actions",
    //   cell: ({ row }) => {
    //     // You can pass whatever you need from `row.original` to the component
    //     return renderComponent(DataTableActions, { id: row.original.id.toString() });
    //   },
    // },

  ] as ColumnDef<GetSalesBookResult[0]>[]
}