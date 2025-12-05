"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GuideSearchProps {
  onSearch: (term: string) => void
  onFilterChange: (categories: string[]) => void
  categories: string[]
}

export default function GuideSearch({ onSearch, onFilterChange, categories }: GuideSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleCategoryChange = (category: string) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]

    setSelectedCategories(newSelectedCategories)
    onFilterChange(newSelectedCategories)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    onFilterChange([])
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search guides..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 futuristic-input"
        />
        <Button onClick={handleSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8" size="sm">
          Search
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {selectedCategories.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                    {selectedCategories.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {selectedCategories.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"}
          </div>
        )}
      </div>
    </div>
  )
}
