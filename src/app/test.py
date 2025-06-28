import requests
import json

# Skills data
skills_data = [
    # Frontend Development
    {
        "name": "React",
        "category": "Frontend Development",
        "proficiency": 95,
        "description": "Expertise in building modern web applications with React",
        "featured": True
    },
    {
        "name": "Next.js",
        "category": "Frontend Development",
        "proficiency": 90,
        "description": "Advanced knowledge of Next.js framework for React applications",
        "featured": True
    },
    {
        "name": "TypeScript",
        "category": "Frontend Development",
        "proficiency": 88,
        "description": "Strong TypeScript skills for type-safe development",
        "featured": True
    },
    {
        "name": "JavaScript",
        "category": "Frontend Development",
        "proficiency": 95,
        "description": "Expert-level JavaScript programming",
        "featured": True
    },
    {
        "name": "Tailwind CSS",
        "category": "Frontend Development",
        "proficiency": 92,
        "description": "Proficient in utility-first CSS with Tailwind",
        "featured": True
    },
    {
        "name": "HTML/CSS",
        "category": "Frontend Development",
        "proficiency": 98,
        "description": "Expert in HTML5 and CSS3 for modern web development",
        "featured": True
    },

    # Backend Development
    {
        "name": "Node.js",
        "category": "Backend Development",
        "proficiency": 85,
        "description": "Strong backend development skills with Node.js",
        "featured": True
    },
    {
        "name": "Express.js",
        "category": "Backend Development",
        "proficiency": 80,
        "description": "Experience in building RESTful APIs with Express.js",
        "featured": True
    },
    {
        "name": "Python",
        "category": "Backend Development",
        "proficiency": 75,
        "description": "Backend development with Python",
        "featured": False
    },
    {
        "name": "MongoDB",
        "category": "Backend Development",
        "proficiency": 82,
        "description": "NoSQL database management with MongoDB",
        "featured": True
    },
    {
        "name": "PostgreSQL",
        "category": "Backend Development",
        "proficiency": 78,
        "description": "Relational database management with PostgreSQL",
        "featured": True
    },
    {
        "name": "REST APIs",
        "category": "Backend Development",
        "proficiency": 88,
        "description": "Design and implementation of RESTful APIs",
        "featured": True
    },

    # Programming Languages
    {
        "name": "JavaScript",
        "category": "Programming Languages",
        "proficiency": 95,
        "description": "Expert-level JavaScript programming across platforms",
        "featured": True
    },
    {
        "name": "TypeScript",
        "category": "Programming Languages",
        "proficiency": 88,
        "description": "Advanced TypeScript development",
        "featured": True
    },
    {
        "name": "Python",
        "category": "Programming Languages",
        "proficiency": 75,
        "description": "Python programming for various applications",
        "featured": False
    },
    {
        "name": "Java",
        "category": "Programming Languages",
        "proficiency": 70,
        "description": "Java programming experience",
        "featured": False
    },
    {
        "name": "C++",
        "category": "Programming Languages",
        "proficiency": 65,
        "description": "C++ programming knowledge",
        "featured": False
    },
    {
        "name": "SQL",
        "category": "Programming Languages",
        "proficiency": 80,
        "description": "SQL for database management and queries",
        "featured": True
    },

    # Tools & Technologies
    {
        "name": "Git & GitHub",
        "category": "Tools & Technologies",
        "proficiency": 90,
        "description": "Version control and collaboration with Git and GitHub",
        "featured": True
    },
    {
        "name": "VS Code",
        "category": "Tools & Technologies",
        "proficiency": 95,
        "description": "Expert in VS Code development environment",
        "featured": True
    },
    {
        "name": "Docker",
        "category": "Tools & Technologies",
        "proficiency": 70,
        "description": "Container management with Docker",
        "featured": False
    },
    {
        "name": "AWS",
        "category": "Tools & Technologies",
        "proficiency": 65,
        "description": "Cloud computing with Amazon Web Services",
        "featured": False
    },
    {
        "name": "Figma",
        "category": "Tools & Technologies",
        "proficiency": 75,
        "description": "UI/UX design with Figma",
        "featured": False
    },
    {
        "name": "Postman",
        "category": "Tools & Technologies",
        "proficiency": 85,
        "description": "API testing and documentation with Postman",
        "featured": True
    }
]

def add_skill(skill_data):
    url = 'http://localhost:3000/api/skills'
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=skill_data, headers=headers)
        response.raise_for_status()
        print(f"Successfully added skill: {skill_data['name']}")
    except requests.exceptions.RequestException as e:
        print(f"Error adding skill {skill_data['name']}: {str(e)}")

def main():
    print("Starting to add skills...")
    for skill in skills_data:
        add_skill(skill)
    print("Finished adding skills!")

if __name__ == "__main__":
    main()
