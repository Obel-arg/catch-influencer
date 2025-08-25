'use client';
import { FaChartLine, FaUsers, FaBullhorn, FaChartPie } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: FaChartLine,
    title: 'Análisis de Métricas',
    description: 'Monitorea el rendimiento de tus campañas con métricas detalladas y en tiempo real.'
  },
  {
    icon: FaUsers,
    title: 'Gestión de Influencers',
    description: 'Administra tu red de influencers y mantén un seguimiento de sus actividades.'
  },
  {
    icon: FaBullhorn,
    title: 'Campañas Efectivas',
    description: 'Crea y gestiona campañas de marketing con influencers de manera eficiente.'
  },
  {
    icon: FaChartPie,
    title: 'Reportes Detallados',
    description: 'Obtén reportes completos sobre el impacto y ROI de tus campañas.'
  }
];

export const LandingView = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Banner negro a la izquierda */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-black via-blue-950 to-black text-white p-12 flex-col justify-center relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <img 
              src="/logo_white.svg" 
              alt="Catch Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">Potencia tu Marketing con Influencers</h1>
          <p className="text-lg opacity-90 mb-8">
            La plataforma todo en uno para gestionar, analizar y optimizar tus campañas con influencers.
          </p>
          <div className="flex gap-4 mb-8">
            <Button asChild size="lg" className="!text-black border-2 border-white bg-white hover:bg-gray-100 hover:border-gray-100 focus:bg-gray-100 focus:border-gray-100 active:bg-gray-100 active:border-gray-100 font-bold transition-colors">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Features a la derecha con animación */}
      <AnimatePresence mode="wait">
        <motion.div
          key="landing-panel"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white"
        >
          <div className="w-full max-w-2xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-black">Características Principales</h2>
              <p className="text-lg text-gray-600">
                Todo lo que necesitas para gestionar tus campañas con influencers de manera efectiva
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-50 rounded-lg shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-200"
                >
                  <feature.icon className="w-8 h-8 text-black mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-black">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
            {/* CTA solo en mobile */}
            <div className="md:hidden flex flex-col items-center gap-4 mt-12">
              <Button asChild size="lg" className="!text-black border-2 border-white bg-white hover:bg-gray-100 hover:border-gray-100 focus:bg-gray-100 focus:border-gray-100 active:bg-gray-100 active:border-gray-100 font-bold transition-colors">
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 