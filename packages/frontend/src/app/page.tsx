'use client';

import { useState } from 'react';
import { addNumbers } from '@/shared/utils/add';
import { formatDate } from '@/shared/utils/format';

export default function Home() {
  const [result, setResult] = useState<number | null>(null);
  const [theme, setTheme] = useState('dark');

  const handleCalculation = () => {
    const sum = addNumbers(5, 3);
    setResult(sum);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const currentTime = formatDate(new Date());

  return (
    <div data-theme={theme} className="min-h-screen bg-base-100">
      <div className="navbar bg-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Chat App</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              Theme
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto">
              {['light', 'dark', 'cupcake', 'dracula'].map((themeName) => (
                <li key={themeName}>
                  <a onClick={() => handleThemeChange(themeName)} className={theme === themeName ? 'active' : ''}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-8">
        <div className="hero min-h-[50vh] bg-base-200 rounded-box">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold mb-4">Monorepo Demo</h1>
              <p className="text-lg opacity-70 mb-6">Built with NextJS, Express, and shared packages</p>
              
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title justify-center">Shared Utils Demo</h2>
                  
                  <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                      <div className="stat-title">Current Time</div>
                      <div className="stat-value text-sm">{currentTime}</div>
                    </div>
                  </div>

                  <div className="card-actions justify-center mt-4">
                    <button 
                      onClick={handleCalculation}
                      className="btn btn-primary btn-wide"
                    >
                      Calculate 5 + 3
                    </button>
                  </div>
                  
                  {result !== null && (
                    <div className="alert alert-success mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Result: {result}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <div className="badge badge-outline">NextJS</div>
                <div className="badge badge-outline ml-2">Express</div>
                <div className="badge badge-outline ml-2">TypeScript</div>
                <div className="badge badge-outline ml-2">PNPM</div>
                <div className="badge badge-outline ml-2">DaisyUI</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
                Frontend
              </h2>
              <p>NextJS with TypeScript and DaisyUI components</p>
              <div className="card-actions justify-end">
                <div className="badge badge-secondary">Port 3000</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                </svg>
                Backend
              </h2>
              <p>Express API server with TypeScript and nodemon</p>
              <div className="card-actions justify-end">
                <div className="badge badge-accent">Port 4000</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Shared
              </h2>
              <p>Shared types and utilities across packages</p>
              <div className="card-actions justify-end">
                <div className="badge badge-primary">Types & Utils</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
        <div>
            <p>Copyright © {new Date().getFullYear()} - All rights reserved by Chat App</p>
        </div>
      </footer>
    </div>
  );
}