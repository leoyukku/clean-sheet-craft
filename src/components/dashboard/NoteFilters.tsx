
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Filter } from "lucide-react";

interface NoteFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function NoteFilters({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: NoteFiltersProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Filter className="mr-2 h-4 w-4" />
        Categories
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={selectedCategory === null}
              onClick={() => onSelectCategory(null)}
            >
              All Categories
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {categories.map((category) => (
            <SidebarMenuItem key={category}>
              <SidebarMenuButton 
                isActive={selectedCategory === category}
                onClick={() => onSelectCategory(category)}
              >
                {category}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
