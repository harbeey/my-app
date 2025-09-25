import React, { useState, useEffect } from "react";
import styles from "./About.module.css";
import {
  FaUsers,
  FaBolt,
  FaChartLine,
  FaShieldAlt,
  FaUserTie,
  FaPaintBrush,
  FaCode,
} from "react-icons/fa";

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  skills?: string[];
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const teamMembers: TeamMember[] = [
    {
      name: "Arbie Ganno",
      role: "Lead Developer",
      avatar: <FaCode />,
      bio: "Full-stack developer with 8+ years experience in React and Node.js",
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    },
    {
      name: "Harvey De Leon & Posa",
      role: "UX/UI & Product Team",
      avatar: <FaUsers />,
      bio: "Collaborative design and product management team focused on user experience",
      skills: ["UX Design", "Product Strategy", "User Research", "Agile"],
    },
    {
      name: "Shan",
      role: "Front-end Developer",
      avatar: <FaPaintBrush />,
      bio: "Creative interface designer crafting beautiful user experiences",
      skills: ["UI Design", "Figma", "Prototyping", "Design Systems"],
    },
  ];

  const features: Feature[] = [
    {
      icon: <FaBolt />,
      title: "Fast & Reliable",
      description: "Built with modern technologies for optimal performance",
    },
    {
      icon: <FaUsers />,
      title: "Team Collaboration",
      description: "Seamless teamwork with real-time updates and communication",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics & Insights",
      description:
        "Track progress and gain valuable insights into your projects",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Private",
      description: "Enterprise-grade security to keep your data safe",
    },
  ];

  const achievements = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Tasks Completed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <main className={`${styles.aboutPage} ${isVisible ? styles.fadeIn : ""}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>About AyaSync</h1>
          <p className={styles.heroSubtitle}>
            Empowering teams to achieve more through intelligent project
            management and seamless collaboration.
          </p>
          <div className={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <div key={index} className={styles.achievementCard}>
                <div className={styles.achievementNumber}>
                  {achievement.number}
                </div>
                <div className={styles.achievementLabel}>
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose AyaSync?</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <h3>
                <FaBolt /> Our Vision
              </h3>
              <p>
                To revolutionize how teams collaborate by providing intuitive,
                powerful tools that eliminate friction and amplify productivity.
              </p>
            </div>
            <div className={styles.missionCard}>
              <h3>⭐ Core Values</h3>
              <ul>
                <li>Simplicity in complex workflows</li>
                <li>Transparency in all communications</li>
                <li>Reliability you can count on</li>
                <li>User feedback drives development</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Meet Our Team</h2>
          <p className={styles.sectionSubtitle}>
            Passionate professionals dedicated to building exceptional
            experiences
          </p>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.memberAvatar}>{member.avatar}</div>
                <h3 className={styles.memberName}>{member.name}</h3>
                <div className={styles.memberRole}>{member.role}</div>
                <p className={styles.memberBio}>{member.bio}</p>
                {member.skills && (
                  <div className={styles.skillTags}>
                    {member.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of teams already using AyaSync to achieve their goals
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>Try AyaSync Free</button>
            <button className={styles.secondaryButton}>Schedule Demo</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
