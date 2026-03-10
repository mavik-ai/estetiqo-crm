'use client'

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface SavedToastProps {
  message?: string;
}

export function SavedToast({ message = 'Salvo com sucesso!' }: SavedToastProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      toast.success(message, { duration: 3000 });
      router.replace(pathname);
    }
  }, []);

  return null;
}
