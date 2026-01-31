import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface ForumCategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    slug: string;
    thread_count: number;
  };
  onClick: () => void;
}

export function ForumCategoryCard({ category, onClick }: ForumCategoryCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{category.icon}</div>
          <div className="flex-1">
            <CardTitle className="text-xl">{category.name}</CardTitle>
            <CardDescription className="mt-1">{category.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{category.thread_count} discussions</span>
        </div>
      </CardContent>
    </Card>
  );
}
