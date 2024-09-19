import { useEffect } from 'react';
import { useRouter } from 'next/router';
import BaikeSearch from '../src/components/baike/baikeSearch';

export default function BaikeSearchPage() {
  const router = useRouter();

  useEffect(() => {
    // 如果是根路径，重定向到 baikeSearch
    if (router.pathname === '/BaikeSearch') {
      router.push('/BaikeSearch/baikeSearch');
    }
  }, [router]);

  return <BaikeSearch />;
}