/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Ícones das Categorias de Listas
 * Fornece ícones vetorizados para Mercado, Farmácia, Estudo, Trabalho, etc.
 */

import React from 'react';
import {
  BookOpen,
  ShoppingCart,
  Pill,
  Briefcase,
  Wallet,
  Activity,
  Home,
  Target,
  Plane,
  Laptop,
  Folder,
} from 'lucide-react';
import { CategoryIconType } from '../types.ts';

interface CategoryIconProps {
  type: CategoryIconType | string;
  size?: number;
  className?: string;
}

export const CATEGORY_DEFINITIONS: {
  id: CategoryIconType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'study', label: 'Estudo', description: 'Faculdade, livros e provas', icon: BookOpen },
  { id: 'market', label: 'Mercado', description: 'Compras de supermercado e feira', icon: ShoppingCart },
  { id: 'pharmacy', label: 'Farmácia', description: 'Remédios, vitaminas e saúde', icon: Pill },
  { id: 'work', label: 'Trabalho', description: 'Projetos, reuniões e estágio', icon: Briefcase },
  { id: 'finance', label: 'Finanças', description: 'Contas, boletos e orçamento', icon: Wallet },
  { id: 'health', label: 'Saúde & Fitness', description: 'Treinos, consultas e bem-estar', icon: Activity },
  { id: 'home', label: 'Casa', description: 'Limpeza, reformas e compras do lar', icon: Home },
  { id: 'personal', label: 'Pessoal', description: 'Hábitos e metas diárias', icon: Target },
  { id: 'travel', label: 'Viagem', description: 'Roteiros, malas e passagens', icon: Plane },
  { id: 'tech', label: 'Tecnologia', description: 'Programação, setup e gadgets', icon: Laptop },
];

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  type,
  size = 20,
  className = '',
}) => {
  const match = CATEGORY_DEFINITIONS.find((cat) => cat.id === type);
  const IconComponent = match ? match.icon : Folder;

  return <IconComponent size={size} className={className} />;
};
