import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@/hooks/useActor";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TableReservationModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function TableReservationModal({
  open,
  onOpenChange,
}: TableReservationModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "19:00",
    guests: "2",
  });
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await actor?.submitContact({
        name: form.name,
        email: "",
        phone: form.phone,
        subject: "Table Reservation",
        message: `Date: ${form.date}, Time: ${form.time}, Guests: ${form.guests}`,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Table reserved! We'll confirm your booking shortly.");
      onOpenChange(false);
      setForm({ name: "", phone: "", date: "", time: "19:00", guests: "2" });
    } catch {
      toast.error("Failed to reserve table. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.18 0.055 260)",
          borderColor: "oklch(0.73 0.115 74 / 0.3)",
        }}
        data-ocid="table.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl gold-text">
            Reserve a Table
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Experience our fine dining at KDM Palace Restaurant
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Full Name *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
              required
              data-ocid="table.name.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Phone *
            </Label>
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              required
              data-ocid="table.phone.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Date *
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
                data-ocid="table.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Time
              </Label>
              <Select value={form.time} onValueChange={(v) => set("time", v)}>
                <SelectTrigger data-ocid="table.time.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["12:00", "13:00", "14:00", "19:00", "20:00", "21:00"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Guests
            </Label>
            <Select value={form.guests} onValueChange={(v) => set("guests", v)}>
              <SelectTrigger data-ocid="table.guests.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4", "5", "6", "8", "10"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n} {Number(n) === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-outline-gold flex-1"
              onClick={() => onOpenChange(false)}
              data-ocid="table.cancel.button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 flex items-center justify-center gap-2"
              disabled={loading}
              data-ocid="table.submit.button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Reserving...
                </>
              ) : (
                "Reserve Table"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
