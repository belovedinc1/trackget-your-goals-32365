import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Pencil, Trash2 } from "lucide-react";
import {
  useRecurringTemplates,
  useUpdateRecurringTemplate,
  useDeleteRecurringTemplate,
  RecurringTemplate,
} from "@/hooks/useRecurringTemplates";
import { useCurrency } from "@/hooks/useCurrency";
import { RecurringTemplateDialog } from "./RecurringTemplateDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RecurringTemplatesList() {
  const { data: templates, isLoading } = useRecurringTemplates();
  const { formatAmount } = useCurrency();
  const updateTemplate = useUpdateRecurringTemplate();
  const deleteTemplate = useDeleteRecurringTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (template: RecurringTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleToggleActive = (template: RecurringTemplate) => {
    updateTemplate.mutate({
      id: template.id,
      is_active: !template.is_active,
    });
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteTemplate.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getDayLabel = (day: number) => {
    const suffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
    return `${day}${suffix}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Expenses
            </CardTitle>
            <CardDescription>
              Recurring expenses that auto-add each month
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingTemplate(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {!templates || templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scheduled expenses yet</p>
              <p className="text-sm">Add recurring expenses to auto-track monthly bills</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    template.is_active ? "bg-background" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{template.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getDayLabel(template.schedule_day)} of month
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.category} • {formatAmount(template.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => handleToggleActive(template)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RecurringTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduled Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this recurring expense template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
