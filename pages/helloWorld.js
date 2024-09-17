import React from 'react';
import Navbar from '../src/components/ui/navbar';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';

function HelloWorld() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 page-content">
        <aside className="w-64 bg-secondary p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#conversation">对话</a>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#recognition">识别</a>
                </Button>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-4">Hello, World!</h1>
          <p className="mb-4">Welcome to my Next.js page.</p>
          <Badge variant="secondary">Next.js</Badge>
          <Button>默认按钮</Button>
          <Button variant="destructive">危险按钮</Button>
          <Button size="sm">小按钮</Button>
        </main>
      </div>
    </div>
  );
}

export default HelloWorld;
