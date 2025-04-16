"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { ReferralType } from '@/services/referral-service';
import { toast } from 'sonner';

interface ReferralCheckProps {
  type: ReferralType;
  slug: string;
  onCheckComplete: (hasReferral: boolean) => void;
  redirectPath?: string; // Куда перенаправлять при отсутствии направления
}

export function ReferralCheck({ 
  type, 
  slug, 
  onCheckComplete,
  redirectPath = '/doctor-appointment/procedures/referral-not-found'
}: ReferralCheckProps) {
  const router = useRouter();
  const { userProfile, checkReferral } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    async function verifyReferral() {
      if (!userProfile?.id) return;
      
      setIsChecking(true);
      
      try {
        const hasReferral = await checkReferral(type, slug);
        
        if (!hasReferral) {
          // Если направления нет, перенаправляем на страницу ошибки
          router.push(redirectPath);
          return;
        }
        
        // Сообщаем родительскому компоненту о результате проверки
        onCheckComplete(true);
      } catch (error) {
        console.error("Ошибка при проверке направления:", error);
        toast.error("Не удалось проверить наличие направления");
        onCheckComplete(false);
      } finally {
        setIsChecking(false);
      }
    }
    
    verifyReferral();
  }, [userProfile?.id, type, slug, checkReferral, router, redirectPath, onCheckComplete]);
  
  // Компонент не имеет визуального представления
  return null;
} 