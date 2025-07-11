// src/components/SidebarMenu.tsx
'use client';

import React, { useState } from 'react';
import { Play, Radio, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../styles/sidebar-menu.css';

// Solo Radio y TV como opciones
const menuItems = [
  { icon: Radio, name: 'Radio', path: '/' },
  { icon: Tv, name: 'TV', path: '/tv' }
];

const SidebarMenu: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };
  
  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  return (
    <div 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-icon">
        <div className="sidebar-icon-inner">
          <Play size={20} />
        </div>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => {
          // Determina si este item está activo basado en la ruta actual
          const isActive = pathname === item.path;
          
          return (
            <Link href={item.path} key={index} className="menu-link">
              <div className={`menu-item ${isActive ? 'active' : 'inactive'}`}>
                <div className="menu-item-icon">
                  <item.icon size={24} />
                </div>
                <span className="menu-item-text">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Se eliminó la etiqueta NEW */}
    </div>
  );
};

export default SidebarMenu;
