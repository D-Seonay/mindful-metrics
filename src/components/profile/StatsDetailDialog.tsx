import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface StatsDetailDialogProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
}

export function StatsDetailDialog<T extends { id: string; date: string }>({
  title,
  description,
  data,
  columns,
}: StatsDetailDialogProps<T>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full mt-2">
          <Eye className="mr-2 h-4 w-4" />
          Voir détails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[50vh]">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        {columns.map((col, index) => (
                        <TableHead key={index}>{col.header}</TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data && data.length > 0 ? (
                        data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-muted-foreground">
                            {format(new Date(item.date), "Pp", { locale: fr })}
                            </TableCell>
                            {columns.map((col, index) => (
                            <TableCell key={index}>{col.accessor(item)}</TableCell>
                            ))}
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell
                            colSpan={columns.length + 1}
                            className="text-center h-24 text-muted-foreground"
                        >
                            Aucune donnée enregistrée.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
