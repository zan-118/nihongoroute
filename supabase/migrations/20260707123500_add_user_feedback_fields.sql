-- Tambah kolom status, admin_reply, dan updated_at pada tabel user_feedback
ALTER TABLE public.user_feedback
ADD COLUMN status text DEFAULT 'pending' NOT NULL CHECK (status = ANY (ARRAY['pending','investigating','resolved','rejected'])),
ADD COLUMN admin_reply text,
ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;

-- Trigger handle_updated_at untuk user_feedback sebelum UPDATE
CREATE TRIGGER set_user_feedback_updated_at BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- RLS Policy: Izinkan user melihat feedback miliknya sendiri
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Fungsi trigger untuk mengotomatisasi penyisipan notifikasi saat feedback di-update
CREATE OR REPLACE FUNCTION public.handle_feedback_update_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_type_label text;
    v_status_label text;
BEGIN
    -- Kirim notifikasi jika status atau admin_reply berubah, dan user_id terasosiasi
    IF (OLD.status IS DISTINCT FROM NEW.status OR OLD.admin_reply IS DISTINCT FROM NEW.admin_reply) 
       AND NEW.user_id IS NOT NULL THEN
       
        -- Mapping tipe feedback ke label bahasa Indonesia
        v_type_label := CASE NEW.type
            WHEN 'bug' THEN 'Bug'
            WHEN 'suggestion' THEN 'Saran'
            WHEN 'compliment' THEN 'Pujian'
            ELSE 'Laporan'
        END;

        -- Mapping status feedback ke label bahasa Indonesia
        v_status_label := CASE NEW.status
            WHEN 'pending' THEN 'Menunggu'
            WHEN 'investigating' THEN 'Sedang Diperiksa'
            WHEN 'resolved' THEN 'Selesai'
            WHEN 'rejected' THEN 'Ditolak'
            ELSE NEW.status
        END;

        -- Sisipkan notifikasi baru ke tabel notifications
        INSERT INTO public.notifications (
            user_id,
            sender_id,
            type,
            title,
            message,
            post_id,
            read,
            created_at
        ) VALUES (
            NEW.user_id,
            NULL,
            CASE WHEN NEW.status = 'resolved' THEN 'success' ELSE 'info' END,
            'Tanggapan Masukan',
            'Laporan ' || v_type_label || ' Anda sekarang: [' || v_status_label || '].' || 
            CASE WHEN NEW.admin_reply IS NOT NULL AND NEW.admin_reply <> '' THEN ' Balasan admin: ' || NEW.admin_reply ELSE '' END,
            NULL,
            false,
            now()
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger untuk notifications setelah UPDATE pada user_feedback
CREATE TRIGGER tr_feedback_update_notification
AFTER UPDATE ON public.user_feedback
FOR EACH ROW
EXECUTE FUNCTION public.handle_feedback_update_notification();
