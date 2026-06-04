"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileDown, Search, BookOpen, Calendar, User } from "lucide-react";

const papers = [
  { id: 1, title: "Attention Is All You Need",              author: "Vaswani et al.", year: 2017, category: "NLP",   size: "2.1 MB", tags: ["Transformers", "Attention"] },
  { id: 2, title: "BERT: Pre-training Deep Bidirectional",  author: "Devlin et al.", year: 2018, category: "NLP",   size: "1.8 MB", tags: ["BERT", "Language Models"] },
  { id: 3, title: "An Image is Worth 16x16 Words",          author: "Dosovitskiy et al.", year: 2020, category: "CV", size: "3.4 MB", tags: ["ViT", "Vision"] },
  { id: 4, title: "Deep Residual Learning for Image Rec.",  author: "He et al.",     year: 2015, category: "CV",   size: "1.2 MB", tags: ["ResNet", "CNN"] },
  { id: 5, title: "GPT-4 Technical Report",                 author: "OpenAI",        year: 2023, category: "LLM",  size: "4.7 MB", tags: ["GPT-4", "LLMs"] },
  { id: 6, title: "Constitutional AI: Harmlessness from AI",author: "Bai et al.",    year: 2022, category: "Safety",size: "2.9 MB", tags: ["Safety", "RLHF"] },
];

const categoryColors: Record<string, string> = {
  NLP:    "bg-blue-500/10 text-blue-600 border-blue-200",
  CV:     "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  LLM:    "bg-violet-500/10 text-violet-600 border-violet-200",
  Safety: "bg-orange-500/10 text-orange-600 border-orange-200",
};

export default function PapersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = papers.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.author.toLowerCase().includes(search.toLowerCase());
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
            <SelectItem value="NLP">NLP</SelectItem>
            <SelectItem value="CV">Computer Vision</SelectItem>
            <SelectItem value="LLM">LLMs</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Papers Grid */}
      {filtered.length === 0 ? (
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
                    {paper.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${categoryColors[paper.category]}`}
                  >
                    {paper.category}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-3 text-xs mt-1">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{paper.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{paper.year}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {paper.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{paper.size}</span>
                  <Button size="sm" className="gap-1.5 text-xs h-8">
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