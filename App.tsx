import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Auth from './components/Auth';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { Session } from '@supabase/supabase-js';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [])

  const handleShowAuth = () => {
    setShowAuth(true);
  }

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen relative overflow-x-hidden">
      {!session ? (
        showAuth ? (
          <Auth />
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
            </div>
            <div className="relative z-10">
              <Header session={session} onShowAuth={handleShowAuth} />
              <main>
                <Hero onShowAuth={handleShowAuth} />
                <Features />
                <Testimonials />
                <CTA onShowAuth={handleShowAuth} />
              </main>
              <Footer />
            </div>
            <ChatBot />
          </>
        )
      ) : (
        <Profile session={session} />
      )}
    </div>
  );
};

export default App;
