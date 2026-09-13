import React from 'react';
import {
  Utensils,
  Bus,
  ShoppingBag,
  Home,
  TrendingUp,
  HelpCircle,
  Briefcase,
  Laptop,
  Store,
  Percent,
  RotateCcw,
  Coins,
  ArrowLeftRight,
  Wallet,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Bus':
      return <Bus {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'Store':
      return <Store {...props} />;
    case 'Percent':
      return <Percent {...props} />;
    case 'RotateCc':
    case 'RotateCcw':
      return <RotateCcw {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'ArrowLeftRight':
      return <ArrowLeftRight {...props} />;
    case 'Wallet':
      return <Wallet {...props} />;
    case 'HelpCircle':
    default:
      return <HelpCircle {...props} />;
  }
};
