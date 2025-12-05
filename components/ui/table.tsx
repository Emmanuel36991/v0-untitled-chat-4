import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full">
      <div className="overflow-x-auto overflow-y-hidden rounded-2xl border-2 border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-sm">
        {/* Gradient fade effects for scroll indication */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300"
          id="scroll-fade-left"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300"
          id="scroll-fade-right"
        />

        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm border-collapse", "bg-white dark:bg-gray-900", className)}
          {...props}
        />
      </div>

      <div className="flex justify-center mt-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
          <span className="font-medium">Scroll horizontally to view more columns</span>
          <div
            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
            style={{ animationDelay: "500ms" }}
          ></div>
        </div>
      </div>
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50",
        "border-b-2 border-gray-300 dark:border-gray-700",
        "sticky top-0 z-20",
        "backdrop-blur-md",
        "[&_tr]:border-b-0",
        className,
      )}
      {...props}
    />
  ),
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        "divide-y divide-gray-200 dark:divide-gray-800",
        "bg-white dark:bg-gray-900",
        "[&_tr:last-child]:border-0",
        "[&_tr]:transition-all [&_tr]:duration-300 [&_tr]:ease-in-out",
        "[&_tr:hover]:bg-gradient-to-r [&_tr:hover]:from-blue-50/80 [&_tr:hover]:via-purple-50/40 [&_tr:hover]:to-pink-50/80",
        "[&_tr:hover]:dark:from-blue-950/30 [&_tr:hover]:dark:via-purple-950/20 [&_tr:hover]:dark:to-pink-950/30",
        "[&_tr:hover]:shadow-lg [&_tr:hover]:shadow-blue-100/50 [&_tr:hover]:dark:shadow-blue-900/30",
        "[&_tr:hover]:scale-[1.01] [&_tr:hover]:z-10",
        className,
      )}
      {...props}
    />
  ),
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        "border-t-2 border-gray-300 dark:border-gray-700",
        "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50",
        "font-medium",
        "[&>tr]:last:border-b-0",
        "sticky bottom-0 z-20",
        "backdrop-blur-md",
        className,
      )}
      {...props}
    />
  ),
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-gray-200 dark:border-gray-800",
        "transition-all duration-300 ease-in-out",
        "hover:bg-gradient-to-r hover:from-blue-50/90 hover:via-purple-50/50 hover:to-pink-50/90",
        "dark:hover:from-blue-950/40 dark:hover:via-purple-950/25 dark:hover:to-pink-950/40",
        "hover:shadow-xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/40",
        "hover:scale-[1.01] hover:z-10",
        "data-[state=selected]:bg-gradient-to-r data-[state=selected]:from-blue-100 data-[state=selected]:via-purple-100 data-[state=selected]:to-pink-100",
        "dark:data-[state=selected]:from-blue-900/50 dark:data-[state=selected]:via-purple-900/40 dark:data-[state=selected]:to-pink-900/50",
        "data-[state=selected]:border-blue-300 dark:data-[state=selected]:border-blue-700",
        "data-[state=selected]:shadow-lg",
        "group",
        "relative",
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-16 px-6 text-left align-middle",
        "font-bold text-xs uppercase tracking-widest",
        "text-gray-800 dark:text-gray-200",
        "bg-transparent",
        "border-r border-gray-300/50 dark:border-gray-700/50 last:border-r-0",
        "whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0",
        "relative",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:via-transparent before:to-white/20 before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:via-purple-500 after:to-pink-500 after:opacity-0 after:transition-opacity after:duration-300",
        "hover:after:opacity-100",
        className,
      )}
      {...props}
    />
  ),
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-6 py-5 align-middle",
        "text-gray-900 dark:text-gray-100",
        "border-r border-gray-200/50 dark:border-gray-800/50 last:border-r-0",
        "[&:has([role=checkbox])]:pr-0",
        "relative",
        "group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-blue-50/40 group-hover:to-transparent",
        "dark:group-hover:from-transparent dark:group-hover:via-blue-900/20 dark:group-hover:to-transparent",
        "transition-all duration-300",
        className,
      )}
      {...props}
    />
  ),
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn(
        "mt-8 text-sm text-gray-600 dark:text-gray-400",
        "bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50",
        "px-6 py-4 rounded-xl",
        "border-2 border-gray-200 dark:border-gray-700",
        "shadow-md",
        "backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  ),
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
