
// This is a utility for seeding the dashboard with sample data
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNeighborhood } from '@/hooks/useNeighborhood';

/**
 * Hook for seeding the dashboard with sample data
 * IMPORTANT: Only for development use!
 */
export const useSeedDashboard = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const user = useUser();
  const { neighborhood } = useNeighborhood();

  // Function to seed the database with sample data
  const seedDatabase = async () => {
    if (!user || !neighborhood?.id) {
      toast.error("You must be logged in and have a neighborhood selected to seed data");
      return;
    }

    try {
      setIsSeeding(true);
      toast.loading("Seeding database with sample data...");

      // Safety Updates
      const safetyUpdates = [
        {
          type: 'alert',
          title: 'Road Closure on Maple Street',
          description: 'Due to construction, Maple Street will be closed between Oak Ave and Pine Drive from June 1st to June 15th.',
          author_id: user.id,
          neighborhood_id: neighborhood.id
        },
        {
          type: 'notice',
          title: 'New Stop Sign at Elm and 5th',
          description: 'A new stop sign has been installed at the intersection of Elm Street and 5th Avenue. Please drive carefully in this area.',
          author_id: user.id,
          neighborhood_id: neighborhood.id
        },
        {
          type: 'emergency',
          title: 'Potential Gas Leak',
          description: 'Residents of Cedar Heights apartments should evacuate immediately due to a potential gas leak. Emergency services have been notified.',
          author_id: user.id,
          neighborhood_id: neighborhood.id
        }
      ];

      await supabase.from('safety_updates').insert(safetyUpdates);

      // Events
      const today = new Date();
      const events = [
        {
          title: 'Community Cleanup Day',
          description: 'Join us for a day of cleaning up our neighborhood parks and streets. Gloves and bags will be provided.',
          time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 10, 0).toISOString(),
          location: 'Central Park',
          host_id: user.id,
          neighborhood_id: neighborhood.id
        },
        {
          title: 'Block Party',
          description: 'Annual neighborhood block party! Bring a dish to share and meet your neighbors.',
          time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 16, 0).toISOString(),
          location: 'Maple Street',
          host_id: user.id,
          neighborhood_id: neighborhood.id
        },
        {
          title: 'Gardening Workshop',
          description: 'Learn about native plants and sustainable gardening practices from local experts.',
          time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15, 14, 0).toISOString(),
          location: 'Community Center',
          host_id: user.id,
          neighborhood_id: neighborhood.id
        }
      ];

      await supabase.from('events').insert(events);

      // Skills Exchange
      const skills = [
        {
          title: 'Javascript Tutoring',
          description: 'I can help you learn Javascript basics or advanced concepts.',
          request_type: 'offer',
          skill_category: 'education',
          user_id: user.id,
          valid_until: new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).toISOString(),
          neighborhood_id: neighborhood.id
        },
        {
          title: 'Need Help with Plumbing',
          description: 'Looking for someone who can help fix a leaky faucet in my bathroom.',
          request_type: 'need',
          skill_category: 'trade',
          user_id: user.id,
          valid_until: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString(),
          neighborhood_id: neighborhood.id
        },
        {
          title: 'Photography Lessons',
          description: 'Professional photographer offering basic photography lessons.',
          request_type: 'offer',
          skill_category: 'creative',
          user_id: user.id,
          valid_until: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()).toISOString(),
          neighborhood_id: neighborhood.id
        }
      ];

      await supabase.from('skills_exchange').insert(skills);

      // Goods Exchange
      const goods = [
        {
          title: 'Gently Used Sofa',
          description: 'Beige sofa in good condition, about 5 years old. Must pick up.',
          request_type: 'offer',
          category: 'goods',
          goods_category: 'furniture',
          user_id: user.id,
          valid_until: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString(),
          neighborhood_id: neighborhood.id
        },
        {
          title: 'Looking for Garden Tools',
          description: 'Getting started with gardening and need basic tools like a trowel, pruners, etc.',
          request_type: 'need',
          category: 'goods',
          goods_category: 'tools',
          user_id: user.id,
          valid_until: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString(),
          neighborhood_id: neighborhood.id
        },
        {
          title: 'Children\'s Books',
          description: 'Collection of children\'s books for ages 3-8, all in excellent condition.',
          request_type: 'offer',
          category: 'goods',
          goods_category: 'books',
          user_id: user.id,
          valid_until: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString(),
          neighborhood_id: neighborhood.id
        }
      ];

      await supabase.from('goods_exchange').insert(goods);

      toast.dismiss();
      toast.success("Successfully seeded database with sample data!");
    } catch (error) {
      console.error("Error seeding database:", error);
      toast.error("Error seeding database. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  return {
    seedDatabase,
    isSeeding
  };
};
