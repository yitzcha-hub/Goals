import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface ToDoItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

const ToDoList: React.FC = () => {
  const [todos, setTodos] = useState<ToDoItem[]>([
    { id: '1', title: 'Review project proposal', completed: false, dueDate: new Date(), priority: 'high' },
    { id: '2', title: 'Schedule team meeting', completed: false, dueDate: new Date(Date.now() + 86400000), priority: 'medium' },
    { id: '3', title: 'Update documentation', completed: true, priority: 'low' }
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        title: newTodo,
        completed: false,
        dueDate: selectedDate,
        priority: 'medium'
      }]);
      setNewTodo('');
      setSelectedDate(undefined);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
              </PopoverContent>
            </Popover>
            <Button onClick={addTodo}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                <div className="flex-1">
                  <p className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.title}</p>
                  {todo.dueDate && (
                    <p className="text-xs text-gray-500">Due: {format(todo.dueDate, 'MMM dd, yyyy')}</p>
                  )}
                </div>
                <Badge className={priorityColors[todo.priority]}>{todo.priority}</Badge>
                <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" className="rounded-md border" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ToDoList;
