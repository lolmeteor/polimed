"use client"

import React from 'react';
import Layout from '@/components/layout';
import InstitutionSelector from '@/components/InstitutionSelector';

export default function HomePage() {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Выбор медицинского учреждения</h1>
        <InstitutionSelector />
      </div>
    </Layout>
  );
}

