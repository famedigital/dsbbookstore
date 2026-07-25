"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BookOption = {
  id: string;
  title: string;
};

type Line = {
  key: string;
  book_id: string;
  qty_ordered: string;
  unit_cost_btn: string;
};

type PoLineEditorProps = {
  books: BookOption[];
};

function newLine(): Line {
  return {
    key: crypto.randomUUID(),
    book_id: "",
    qty_ordered: "1",
    unit_cost_btn: "0",
  };
}

export function PoLineEditor({ books }: PoLineEditorProps) {
  const [lines, setLines] = useState<Line[]>([newLine()]);

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>Line items</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setLines((prev) => [...prev, newLine()])}
        >
          Add line
        </Button>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <div
            key={line.key}
            className="grid gap-3 sm:grid-cols-[1fr_6rem_7rem_auto] sm:items-end"
          >
            <div className="space-y-2">
              {index === 0 ? <Label>Book</Label> : null}
              <select
                name="book_id"
                required
                value={line.book_id}
                onChange={(e) => updateLine(line.key, { book_id: e.target.value })}
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
              >
                <option value="">Select a book…</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {index === 0 ? <Label>Qty</Label> : null}
              <Input
                name="qty_ordered"
                type="number"
                min="1"
                required
                value={line.qty_ordered}
                onChange={(e) =>
                  updateLine(line.key, { qty_ordered: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              {index === 0 ? <Label>Unit cost</Label> : null}
              <Input
                name="unit_cost_btn"
                type="number"
                min="0"
                step="0.01"
                value={line.unit_cost_btn}
                onChange={(e) =>
                  updateLine(line.key, { unit_cost_btn: e.target.value })
                }
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={lines.length <= 1}
              onClick={() => removeLine(line.key)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
