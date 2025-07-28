/**
 * Enhanced seeding system for creating realistic demo neighborhoods
 * 
 * This system creates a fully populated neighborhood that appears to have been
 * active for 30 days, complete with realistic user interactions and content.
 */
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DemoNeighborhoodSeeder');

// Interface for demo user data from CSV
export interface DemoUserData {
  firstName: string;
  lastName: string;
  bio?: string;
  skills?: string[];
  address?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

// Interface for demo neighborhood configuration
export interface DemoNeighborhoodConfig {
  name: string;
  city: string;
  state: string;
  address?: string;
  timezone?: string;
  users: DemoUserData[];
}

/**
 * Creates a realistic demo neighborhood with backdated content
 * 
 * @param config - Configuration for the demo neighborhood
 * @param creatorUserId - The user ID who will be the neighborhood creator
 * @returns Promise<string | null> - The created neighborhood ID or null on error
 */
export async function seedDemoNeighborhood(
  config: DemoNeighborhoodConfig,
  creatorUserId: string
): Promise<string | null> {
  try {
    logger.info("Starting demo neighborhood seeding", { 
      neighborhoodName: config.name,
      userCount: config.users.length 
    });

    // Step 1: Create the neighborhood
    const neighborhoodId = await createNeighborhood(config, creatorUserId);
    if (!neighborhoodId) {
      throw new Error("Failed to create neighborhood");
    }

    // Step 2: Create demo user profiles (all with ycdemo@neighborhoodos.com)
    const userIds = await createDemoUsers(config.users, neighborhoodId);
    if (userIds.length === 0) {
      throw new Error("Failed to create demo users");
    }

    // Step 3: Generate backdated content across 30 days
    await generateBackdatedContent(neighborhoodId, userIds);

    logger.info("Demo neighborhood seeding completed successfully", { 
      neighborhoodId,
      createdUsers: userIds.length 
    });

    return neighborhoodId;

  } catch (error) {
    logger.error("Error seeding demo neighborhood:", error);
    return null;
  }
}

/**
 * Creates the demo neighborhood
 */
async function createNeighborhood(
  config: DemoNeighborhoodConfig,
  creatorUserId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('create_neighborhood_as_super_admin', {
      neighborhood_name: config.name,
      neighborhood_city: config.city,
      neighborhood_state: config.state,
      neighborhood_address: config.address || `${config.city}, ${config.state}`,
      neighborhood_timezone: config.timezone || 'America/Los_Angeles'
    });

    if (error) {
      logger.error("Error creating neighborhood:", error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error("Error in createNeighborhood:", error);
    return null;
  }
}

/**
 * Creates demo user profiles and adds them to the neighborhood
 * All users will have email: ycdemo@neighborhoodos.com
 */
async function createDemoUsers(
  users: DemoUserData[],
  neighborhoodId: string
): Promise<string[]> {
  const userIds: string[] = [];

  try {
    for (const userData of users) {
      // Generate a UUID for this demo user
      const userId = crypto.randomUUID();
      
      // Create the profile with demo email
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: `${userData.firstName} ${userData.lastName}`,
          bio: userData.bio || `Hi! I'm ${userData.firstName}, happy to be part of this neighborhood community.`,
          skills: userData.skills || [],
          address: userData.address || '',
          phone_number: userData.phoneNumber || '',
          avatar_url: userData.avatarUrl || null,
          email_visible: true,
          phone_visible: !!userData.phoneNumber,
          address_visible: !!userData.address,
          completed_onboarding: true
        });

      if (profileError) {
        logger.error("Error creating profile:", profileError);
        continue;
      }

      // Add user to neighborhood
      const { error: memberError } = await supabase.rpc('add_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });

      if (memberError) {
        logger.error("Error adding user to neighborhood:", memberError);
        continue;
      }

      userIds.push(userId);
      logger.debug("Created demo user:", { userId, name: `${userData.firstName} ${userData.lastName}` });
    }

    return userIds;
  } catch (error) {
    logger.error("Error creating demo users:", error);
    return userIds;
  }
}

/**
 * Generates realistic backdated content across all modules
 */
async function generateBackdatedContent(
  neighborhoodId: string,
  userIds: string[]
): Promise<void> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Generate Safety Updates (5-8 over 30 days)
    await generateSafetyUpdates(neighborhoodId, userIds, thirtyDaysAgo, now);

    // Generate Events (8-12 over 30 days)
    await generateEvents(neighborhoodId, userIds, thirtyDaysAgo, now);

    // Generate Goods Exchange posts (15-20 over 30 days)
    await generateGoodsExchange(neighborhoodId, userIds, thirtyDaysAgo, now);

    // Generate Skills Exchange posts (12-15 over 30 days)
    await generateSkillsExchange(neighborhoodId, userIds, thirtyDaysAgo, now);

    // Generate comments and interactions
    await generateInteractions(neighborhoodId, userIds, thirtyDaysAgo, now);

    logger.info("Backdated content generation completed");
  } catch (error) {
    logger.error("Error generating backdated content:", error);
  }
}

/**
 * Generates safety updates with realistic timestamps
 */
async function generateSafetyUpdates(
  neighborhoodId: string,
  userIds: string[],
  startDate: Date,
  endDate: Date
): Promise<void> {
  const safetyTypes = ['Emergency', 'Suspicious Activity', 'General Safety', 'Weather Alert', 'Community Notice'];
  const updates = [
    {
      type: 'General Safety',
      title: 'Street Light Out on Oak Avenue',
      description: 'The street light at the corner of Oak Ave and 3rd Street has been out for a few days. I\'ve reported it to the city but wanted to let neighbors know to be extra careful walking at night.'
    },
    {
      type: 'Weather Alert',
      title: 'Heavy Rain Expected This Weekend',
      description: 'Weather service is predicting 2-3 inches of rain Saturday and Sunday. Good time to check your gutters and bring in any outdoor furniture.'
    },
    {
      type: 'Community Notice',
      title: 'Road Work Starting Monday',
      description: 'The city will be repaving Maple Street from 1st to 5th Avenue starting Monday. Expect delays and limited parking for about a week.'
    },
    {
      type: 'Suspicious Activity',
      title: 'Unusual Vehicle in Neighborhood',
      description: 'Saw an unfamiliar van parked on Pine Street for several hours yesterday evening. Didn\'t recognize the occupants. Just wanted neighbors to be aware.'
    },
    {
      type: 'General Safety',
      title: 'Loose Dog Alert',
      description: 'Small brown dog (looks like a beagle mix) running loose near the park. No collar visible. Owner please contact me if this is yours!'
    },
    {
      type: 'Community Notice',
      title: 'Neighborhood Watch Meeting',
      description: 'Monthly neighborhood watch meeting this Thursday at 7 PM at the community center. Come discuss recent safety concerns and meet your neighbors.'
    }
  ];

  const safetyUpdateCount = Math.floor(Math.random() * 4) + 5; // 5-8 updates

  for (let i = 0; i < safetyUpdateCount; i++) {
    const update = updates[i % updates.length];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

    const { error } = await supabase
      .from('safety_updates')
      .insert({
        title: update.title,
        description: update.description,
        type: update.type,
        author_id: randomUser,
        neighborhood_id: neighborhoodId,
        created_at: randomDate.toISOString()
      });

    if (error) {
      logger.error("Error creating safety update:", error);
    }
  }
}

/**
 * Generates events with realistic timestamps
 */
async function generateEvents(
  neighborhoodId: string,
  userIds: string[],
  startDate: Date,
  endDate: Date
): Promise<void> {
  const events = [
    {
      title: 'Community Garden Workday',
      description: 'Join us for our monthly community garden maintenance! We\'ll be weeding, planting, and harvesting. Bring gloves and water bottle.',
      location: 'Community Garden, 123 Green St'
    },
    {
      title: 'Neighborhood Block Party',
      description: 'Annual summer block party with BBQ, games for kids, and live music. Bring a side dish to share!',
      location: 'Maple Street (blocked off)'
    },
    {
      title: 'Book Club Meeting',
      description: 'This month we\'re discussing "The Seven Husbands of Evelyn Hugo". New members welcome!',
      location: 'Sarah\'s house, 456 Oak Ave'
    },
    {
      title: 'Kids Movie Night',
      description: 'Outdoor movie screening of "Encanto" in the park. Bring blankets and chairs!',
      location: 'Neighborhood Park'
    },
    {
      title: 'Garage Sale Extravaganza',
      description: 'Multi-family garage sale! Electronics, furniture, clothes, books, and more. Early birds welcome.',
      location: 'Various houses on Pine Street'
    },
    {
      title: 'Community Clean-Up Day',
      description: 'Let\'s beautify our neighborhood! We\'ll focus on the park area and main walking paths.',
      location: 'Meet at Community Center'
    },
    {
      title: 'Potluck Dinner',
      description: 'Monthly potluck dinner to get to know your neighbors better. Theme this month: comfort food!',
      location: 'Community Center'
    },
    {
      title: 'Walking Group',
      description: 'Weekly walking group for all fitness levels. We\'ll explore different routes around the neighborhood.',
      location: 'Meet at the park entrance'
    }
  ];

  const eventCount = Math.floor(Math.random() * 5) + 8; // 8-12 events

  for (let i = 0; i < eventCount; i++) {
    const event = events[i % events.length];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    // Event time should be in the future relative to creation date
    const eventTime = new Date(randomDate.getTime() + Math.random() * (7 * 24 * 60 * 60 * 1000)); // 0-7 days after creation

    const { error } = await supabase
      .from('events')
      .insert({
        title: event.title,
        description: event.description,
        location: event.location,
        time: eventTime.toISOString(),
        host_id: randomUser,
        neighborhood_id: neighborhoodId,
        created_at: randomDate.toISOString()
      });

    if (error) {
      logger.error("Error creating event:", error);
    }
  }
}

/**
 * Generates goods exchange posts
 */
async function generateGoodsExchange(
  neighborhoodId: string,
  userIds: string[],
  startDate: Date,
  endDate: Date
): Promise<void> {
  const goodsOffers = [
    { title: 'Free Moving Boxes', description: 'Just finished moving and have about 20 good moving boxes to give away. Various sizes, all in great condition.', category: 'Home & Garden' },
    { title: 'Kids Bicycle - Size 16"', description: 'Red kids bike, barely used. My daughter outgrew it quickly. Great condition, just needs air in tires.', category: 'Kids & Baby' },
    { title: 'Garden Tools', description: 'Extra set of garden tools - shovel, rake, hand trowel, and pruning shears. All in good working condition.', category: 'Home & Garden' },
    { title: 'Board Games Collection', description: 'Downsizing and have too many board games. All complete and in good condition. Great for family game nights!', category: 'Books & Games' },
    { title: 'Winter Coat - Women\'s Medium', description: 'Warm winter coat, barely worn. Black, down-filled, perfect for cold weather. Smoke-free home.', category: 'Clothing' }
  ];

  const goodsRequests = [
    { title: 'Looking for Lawn Mower', description: 'Our mower finally died. Looking to borrow or buy an inexpensive push mower for small yard.', category: 'Home & Garden' },
    { title: 'Need Baby Gate', description: 'We have a new crawler! Looking for a baby gate for the top of stairs. Safety is our priority.', category: 'Kids & Baby' },
    { title: 'Car Jumper Cables', description: 'My car battery died this morning. Anyone have jumper cables I could borrow? I\'m on Pine Street.', category: 'Automotive', urgency: 'urgent' },
    { title: 'Folding Tables for Party', description: 'Planning a birthday party next weekend. Could use 2-3 folding tables if anyone has extras.', category: 'Events & Party' }
  ];

  const goodsCount = Math.floor(Math.random() * 6) + 15; // 15-20 posts

  for (let i = 0; i < goodsCount; i++) {
    const isOffer = Math.random() > 0.3; // 70% offers, 30% requests
    const items = isOffer ? goodsOffers : goodsRequests;
    const item = items[Math.floor(Math.random() * items.length)];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const validUntil = new Date(randomDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // Valid for 2 weeks

    const { error } = await supabase
      .from('goods_exchange')
      .insert({
        title: item.title,
        description: item.description,
        request_type: isOffer ? 'offer' : 'need',
        goods_category: item.category,
        urgency: (item as any).urgency || 'normal',
        condition: isOffer ? (Math.random() > 0.5 ? 'excellent' : 'good') : undefined,
        user_id: randomUser,
        neighborhood_id: neighborhoodId,
        valid_until: validUntil.toISOString(),
        created_at: randomDate.toISOString()
      });

    if (error) {
      logger.error("Error creating goods exchange post:", error);
    }
  }
}

/**
 * Generates skills exchange posts
 */
async function generateSkillsExchange(
  neighborhoodId: string,
  userIds: string[],
  startDate: Date,
  endDate: Date
): Promise<void> {
  const skillsOffers = [
    { title: 'Free Guitar Lessons', description: 'Professional musician offering beginner guitar lessons. Great for kids or adults just starting out!', category: 'Music & Arts' },
    { title: 'Computer Help for Seniors', description: 'Happy to help older neighbors with computer, smartphone, or tablet questions. Patient and experienced teacher.', category: 'Technology' },
    { title: 'Garden Design Consultation', description: 'Landscape designer offering free consultations for small garden makeovers. Let\'s make your yard beautiful!', category: 'Home & Garden' },
    { title: 'Babysitting Services', description: 'Experienced babysitter available for date nights or short-term childcare. References available.', category: 'Childcare' },
    { title: 'Basic Car Maintenance', description: 'Auto mechanic happy to help neighbors with oil changes, tire rotations, and basic car maintenance.', category: 'Automotive' }
  ];

  const skillsRequests = [
    { title: 'Need Help Moving Furniture', description: 'Moving heavy furniture to second floor. Looking for a couple strong neighbors to help out. Pizza and beer provided!', category: 'Moving & Labor' },
    { title: 'Dog Walking While on Vacation', description: 'Going out of town next week. Looking for someone to walk my friendly golden retriever twice a day.', category: 'Pet Care' },
    { title: 'Tutoring for High School Math', description: 'My daughter is struggling with algebra. Looking for someone patient to help her a couple times a week.', category: 'Education' },
    { title: 'Help with Yard Cleanup', description: 'Elderly neighbor needs help raking leaves and general yard cleanup. A few hours of work this weekend.', category: 'Home & Garden' }
  ];

  const skillsCount = Math.floor(Math.random() * 4) + 12; // 12-15 posts

  for (let i = 0; i < skillsCount; i++) {
    const isOffer = Math.random() > 0.4; // 60% offers, 40% requests
    const skills = isOffer ? skillsOffers : skillsRequests;
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const validUntil = new Date(randomDate.getTime() + (21 * 24 * 60 * 60 * 1000)); // Valid for 3 weeks

    const { error } = await supabase
      .from('skills_exchange')
      .insert({
        title: skill.title,
        description: skill.description,
        request_type: isOffer ? 'offer' : 'need',
        skill_category: skill.category,
        user_id: randomUser,
        neighborhood_id: neighborhoodId,
        valid_until: validUntil.toISOString(),
        created_at: randomDate.toISOString()
      });

    if (error) {
      logger.error("Error creating skills exchange post:", error);
    }
  }
}

/**
 * Generates comments and interactions to make content feel alive
 */
async function generateInteractions(
  neighborhoodId: string,
  userIds: string[],
  startDate: Date,
  endDate: Date
): Promise<void> {
  try {
    // Get safety updates to comment on
    const { data: safetyUpdates } = await supabase
      .from('safety_updates')
      .select('id, created_at')
      .eq('neighborhood_id', neighborhoodId);

    // Add comments to some safety updates
    if (safetyUpdates && safetyUpdates.length > 0) {
      const comments = [
        'Thanks for the heads up!',
        'I noticed this too. Glad someone reported it.',
        'This is really helpful information.',
        'I can help with this if needed.',
        'Thanks for keeping us all informed.',
        'I saw this earlier today as well.',
        'Appreciate you looking out for the neighborhood!'
      ];

      for (const update of safetyUpdates) {
        // 40% chance of getting comments
        if (Math.random() > 0.6) continue;

        const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments
        const updateDate = new Date(update.created_at);

        for (let i = 0; i < numComments; i++) {
          const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
          const comment = comments[Math.floor(Math.random() * comments.length)];
          // Comments should be after the original post
          const commentDate = new Date(updateDate.getTime() + Math.random() * (2 * 24 * 60 * 60 * 1000)); // 0-2 days after post

          const { error } = await supabase
            .from('safety_update_comments')
            .insert({
              content: comment,
              user_id: randomUser,
              safety_update_id: update.id,
              created_at: commentDate.toISOString()
            });

          if (error) {
            logger.error("Error creating comment:", error);
          }
        }
      }
    }

    // Get events to add RSVPs
    const { data: events } = await supabase
      .from('events')
      .select('id, created_at')
      .eq('neighborhood_id', neighborhoodId);

    // Add RSVPs to events
    if (events && events.length > 0) {
      for (const event of events) {
        // Random number of people RSVP (20-60% of neighborhood)
        const rsvpCount = Math.floor(Math.random() * (userIds.length * 0.4)) + Math.floor(userIds.length * 0.2);
        const shuffledUsers = [...userIds].sort(() => Math.random() - 0.5);

        for (let i = 0; i < rsvpCount && i < shuffledUsers.length; i++) {
          const eventDate = new Date(event.created_at);
          // RSVPs should be after event creation
          const rsvpDate = new Date(eventDate.getTime() + Math.random() * (5 * 24 * 60 * 60 * 1000)); // 0-5 days after creation

          const { error } = await supabase
            .from('event_rsvps')
            .insert({
              user_id: shuffledUsers[i],
              event_id: event.id,
              neighborhood_id: neighborhoodId,
              created_at: rsvpDate.toISOString()
            });

          if (error) {
            logger.error("Error creating RSVP:", error);
          }
        }
      }
    }

    logger.info("Interactions generation completed");
  } catch (error) {
    logger.error("Error generating interactions:", error);
  }
}

/**
 * Utility function to call the seeding with super admin privileges
 * This should be called by a super admin user
 */
export async function createDemoNeighborhoodForAdmin(
  config: DemoNeighborhoodConfig
): Promise<string | null> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.error("No authenticated user found");
    return null;
  }

  // Check if user is super admin
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const isSuperAdmin = userRoles?.some(role => role.role === 'super_admin');
  
  if (!isSuperAdmin) {
    logger.error("User is not a super admin");
    return null;
  }

  return await seedDemoNeighborhood(config, user.id);
}