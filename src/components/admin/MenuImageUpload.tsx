import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import { uploadMenuImage, countMenuImages } from '../../lib/menuImages';

type Props = {
  imageUrl: string;
  imageUrl2: string;
  onChange: (next: { image_url: string; image_url_2: string }) => void;
  disabled?: boolean;
};

export default function MenuImageUpload({ imageUrl, imageUrl2, onChange, disabled }: Props) {
  const labelId = useId();
  const slot1Ref = useRef<HTMLInputElement>(null);
  const slot2Ref = useRef<HTMLInputElement>(null);
  const [uploadingSlot, setUploadingSlot] = useState<0 | 1 | 2>(0);
  const [error, setError] = useState('');
  const uploaded = countMenuImages(imageUrl, imageUrl2);

  async function handleFile(slot: 1 | 2, file: File | undefined) {
    if (!file || disabled) return;
    setError('');
    setUploadingSlot(slot);
    try {
      const url = await uploadMenuImage(file);
      if (slot === 1) onChange({ image_url: url, image_url_2: imageUrl2 });
      else onChange({ image_url: imageUrl, image_url_2: url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
    } finally {
      setUploadingSlot(0);
    }
  }

  function clearSlot(slot: 1 | 2) {
    if (slot === 1) onChange({ image_url: '', image_url_2: imageUrl2 });
    else onChange({ image_url: imageUrl, image_url_2: '' });
  }

  return (
    <fieldset className="border border-white/10 bg-vaha-ink p-4" aria-labelledby={labelId}>
      <legend id={labelId} className="px-1 text-sm font-semibold text-vaha-cream">
        Item photos <span className="text-vaha-gold">({uploaded}/2 uploaded)</span>
      </legend>
      <p className="mt-1 text-xs text-vaha-muted">At least 1 image is required. You may add up to 2.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {([
          { slot: 1 as const, url: imageUrl, ref: slot1Ref, label: 'Primary photo' },
          { slot: 2 as const, url: imageUrl2, ref: slot2Ref, label: 'Secondary photo (optional)' },
        ]).map(({ slot, url, ref, label }) => (
          <div key={slot} className="border border-white/10 bg-vaha-ink-soft p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-vaha-muted">{label}</p>
            {url ? (
              <div className="relative mt-2 aspect-[4/3] overflow-hidden border border-vaha-gold/20">
                <Image src={url} alt="" fill className="object-cover" sizes="200px" unoptimized={url.startsWith('http')} />
              </div>
            ) : (
              <div className="mt-2 flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-white/20 bg-black/20 text-xs text-white/50">
                No image yet
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled || uploadingSlot !== 0}
                onClick={() => ref.current?.click()}
                className="border border-vaha-gold/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-vaha-gold hover:bg-vaha-gold hover:text-vaha-ink disabled:opacity-50"
              >
                {uploadingSlot === slot ? 'Uploading…' : url ? 'Replace' : 'Upload'}
              </button>
              {url ? (
                <button
                  type="button"
                  disabled={disabled || uploadingSlot !== 0}
                  onClick={() => clearSlot(slot)}
                  className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-500/20"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input
              ref={ref}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                void handleFile(slot, event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-red-200" role="alert">{error}</p> : null}
      {uploaded < 1 ? (
        <p className="mt-3 text-sm text-amber-200" role="status">Save is blocked until at least 1/2 images are uploaded.</p>
      ) : null}
    </fieldset>
  );
}
