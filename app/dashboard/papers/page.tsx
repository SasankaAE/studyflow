"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileDown, Search, BookOpen, Calendar } from "lucide-react";
import { usePdfs } from "@/hooks/usePdfs";

const categoryColors: Record<string, string> = {
  "Grade 6 CS": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Grade 7 CS": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
};

export default function PapersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { pdfs, loading, download } = usePdfs();

  const filtered = pdfs.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Research Papers</h2>
        <p className="text-sm text-muted-foreground">Browse and download curated AI/ML research papers.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search papers or authors…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Grade 6 CS">Grade 6 CS</SelectItem>
            <SelectItem value="Grade 7 CS">Grade 7 CS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Loading papers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No papers match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((paper) => (
            <Card key={paper.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                    {paper.name}
                  </CardTitle>
                  {paper.category && (
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${categoryColors[paper.category] ?? ""}`}
                    >
                      {paper.category}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-3 text-xs mt-1">
                  {paper.year && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{paper.year}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{paper.size ?? ""}</span>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => download(paper.id, paper.name)}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}