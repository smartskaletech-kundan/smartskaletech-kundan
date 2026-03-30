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
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultRoomType?: string;
}

const inputCls =
  "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-amber-500";
const selectTriggerCls = "bg-white text-slate-900 border-slate-300";

export default function BookingModal({
  open,
  onOpenChange,
  defaultRoomType,
}: BookingModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    roomType: defaultRoomType || "Deluxe Room",
    guests: "2",
    message: "",
  });
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.checkIn ||
      !form.checkOut
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await actor?.submitBooking({
        name: form.name,
        email: form.email,
        phone: form.phone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        roomType: form.roomType,
        guests: BigInt(form.guests),
        message: form.message,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Booking request submitted! We'll confirm shortly.");
      onOpenChange(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        roomType: "Deluxe Room",
        guests: "2",
        message: "",
      });
    } catch {
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.18 0.055 260)",
          borderColor: "oklch(0.73 0.115 74 / 0.3)",
        }}
        data-ocid="booking.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl gold-text">
            Book Your Stay
          </DialogTitle>
          <p className="text-sm text-slate-300">
            Fill in your details and we&apos;ll confirm your reservation
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Full Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                required
                className={inputCls}
                data-ocid="booking.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Email *
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
                required
                className={inputCls}
                data-ocid="booking.email.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Phone *
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                className={inputCls}
                data-ocid="booking.phone.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Check-in *
              </Label>
              <Input
                type="date"
                value={form.checkIn}
                onChange={(e) => set("checkIn", e.target.value)}
                required
                className={inputCls}
                data-ocid="booking.checkin.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Check-out *
              </Label>
              <Input
                type="date"
                value={form.checkOut}
                onChange={(e) => set("checkOut", e.target.value)}
                required
                className={inputCls}
                data-ocid="booking.checkout.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Room Type
              </Label>
              <Select
                value={form.roomType}
                onValueChange={(v) => set("roomType", v)}
              >
                <SelectTrigger
                  className={selectTriggerCls}
                  data-ocid="booking.room_type.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                  <SelectItem value="Super Deluxe Room">
                    Super Deluxe Room
                  </SelectItem>
                  <SelectItem value="Royal Suite">Royal Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Guests
              </Label>
              <Select
                value={form.guests}
                onValueChange={(v) => set("guests", v)}
              >
                <SelectTrigger
                  className={selectTriggerCls}
                  data-ocid="booking.guests.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs uppercase tracking-widest text-slate-300">
                Special Requests
              </Label>
              <Textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Any special requests or requirements..."
                rows={3}
                className={inputCls}
                data-ocid="booking.message.textarea"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-outline-gold flex-1"
              onClick={() => onOpenChange(false)}
              data-ocid="booking.cancel.button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 flex items-center justify-center gap-2"
              disabled={loading}
              data-ocid="booking.submit.button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
