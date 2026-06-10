/**
 * ScrollableTable
 *
 * A reusable wrapper that makes any <table> scroll horizontally
 * when it overflows its container, without breaking the surrounding layout.
 *
 * Usage:
 *   <ScrollableTable minWidth={600} stickyHeader>
 *     <table>…</table>
 *   </ScrollableTable>
 *
 * Props:
 *   minWidth    – minimum pixel width of the inner <table>                 (default: 640)
 *   stickyHeader– adds `position: sticky; top: 0` to all <thead> cells     (default: false)
 *   className   – extra class names on the outer scroll container
 *   maxHeight   – if set, the container scrolls vertically too (px value)
 */

import React from "react";

interface ScrollableTableProps {
    children: React.ReactNode;
    minWidth?: number;
    stickyHeader?: boolean;
    className?: string;
    maxHeight?: number;
}

export default function ScrollableTable({ children, minWidth = 640, stickyHeader = false, className = "", maxHeight }: ScrollableTableProps) {
    return (
        <div
            className={`scrollable-table-outer ${className}`}
            style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
            role="region"
            aria-label="Scrollable table"
            tabIndex={0}
        >
            <div className="scrollable-table-inner" style={{ minWidth }}>
                {stickyHeader ? <StickyHeaderWrapper>{children}</StickyHeaderWrapper> : children}
            </div>

            <style>{`
                .scrollable-table-outer {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    width: 100%;
                    /* thin scrollbar — matches globals.css .scrollbar-thin */
                    scrollbar-width: thin;
                    scrollbar-color: rgba(75, 85, 99, 0.4) transparent;
                }
                .scrollable-table-outer::-webkit-scrollbar {
                    height: 5px;
                }
                .scrollable-table-outer::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollable-table-outer::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.25);
                    border-radius: 3px;
                }
                .scrollable-table-outer::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.45);
                }

                .scrollable-table-inner {
                    width: 100%;
                }

                /* Sticky header support */
                .sticky-header-wrap thead th,
                .sticky-header-wrap thead td {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    /* inherits background from Tailwind/tokens so header stays opaque */
                    background: inherit;
                }
            `}</style>
        </div>
    );
}

/** Internal helper that clones the single <table> child and appends className */
function StickyHeaderWrapper({ children }: { children: React.ReactNode }) {
    // Walk the children and find the <table> element to inject the sticky class
    const cloned = React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === "table") {
            return React.cloneElement(child as React.ReactElement<React.HTMLAttributes<HTMLTableElement>>, {
                className: [(child.props as React.HTMLAttributes<HTMLTableElement>).className || "", "sticky-header-wrap"].filter(Boolean).join(" ")
            });
        }
        return child;
    });
    return <>{cloned}</>;
}
