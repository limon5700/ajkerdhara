import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { ArticleFormData } from '@/components/admin/ArticleForm';

interface ArticleFormProps {
  article?: any;
  onSubmit: (data: ArticleFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ArticleForm({ article, onSubmit, onCancel, isSubmitting }: ArticleFormProps) {
  const form = useForm<ArticleFormData>({
    defaultValues: article || {},
  });
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertAdInline = () => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.slice(0, start) + '[AD_INLINE]' + value.slice(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + '[AD_INLINE]'.length;
      textarea.focus();
      form.setValue('content', newValue);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Title</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Article title" 
                  className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="content"
          control={form.control}
          render={({ field }: { field: any }) => (
            <FormItem className="relative">
              <div className="flex items-center gap-2 mb-2">
                <FormLabel className="text-black">Content</FormLabel>
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertAdInline} className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                  Insert Ad (Label)
                </Button>
              </div>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertAdInline} className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                  Insert Ad (Above)
                </Button>
              </div>
              <FormControl>
                <div className="relative">
                  <Textarea 
                    {...field} 
                    ref={contentRef} 
                    rows={16} 
                    placeholder="Write the article content here..." 
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <Button type="button" variant="secondary" size="icon" onClick={handleInsertAdInline} className="absolute top-2 right-2 z-10 bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                    +
                  </Button>
                </div>
              </FormControl>
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertAdInline} className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                  Insert Ad (Below)
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
} 