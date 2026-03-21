export const demoData = {
  tenants: [
    { id: "tenantA", name: "Green Valley Public School" },
    { id: "tenantB", name: "Shree Saraswati Vidyalaya" }
  ],

  classes: [
    // Tenant A
    { className: "6A", tenantId: "tenantA" },
    { className: "7A", tenantId: "tenantA" },
    { className: "8A", tenantId: "tenantA" },
    { className: "9A", tenantId: "tenantA" },
    { className: "10A", tenantId: "tenantA" },

    // Tenant B
    { className: "5A", tenantId: "tenantB" },
    { className: "6A", tenantId: "tenantB" },
    { className: "7A", tenantId: "tenantB" },
    { className: "8A", tenantId: "tenantB" }
  ],

  teachers: [
    // Tenant A
    {
      name: "Rajesh Sharma",
      email: "rajesh@schoolA.com",
      subject: "Mathematics",
      experience: 8,
      tenantId: "tenantA"
    },
    {
      name: "Neha Verma",
      email: "neha@schoolA.com",
      subject: "Science",
      experience: 6,
      tenantId: "tenantA"
    },
    {
      name: "Amit Patel",
      email: "amit@schoolA.com",
      subject: "English",
      experience: 7,
      tenantId: "tenantA"
    },

    // Tenant B
    {
      name: "Mahesh Joshi",
      email: "mahesh@schoolB.com",
      subject: "Mathematics",
      experience: 10,
      tenantId: "tenantB"
    },
    {
      name: "Pooja Desai",
      email: "pooja@schoolB.com",
      subject: "Science",
      experience: 5,
      tenantId: "tenantB"
    }
  ],

  students: [
    // Tenant A
    {
      name: "Arjun Mehta",
      className: "10A",
      rollNumber: 1,
      age: 15,
      tenantId: "tenantA"
    },
    {
      name: "Riya Shah",
      className: "10A",
      rollNumber: 2,
      age: 15,
      tenantId: "tenantA"
    },
    {
      name: "Kunal Agarwal",
      className: "9A",
      rollNumber: 3,
      age: 14,
      tenantId: "tenantA"
    },
    {
      name: "Sneha Kapoor",
      className: "8A",
      rollNumber: 4,
      age: 13,
      tenantId: "tenantA"
    },

    // Tenant B
    {
      name: "Dhruv Patel",
      className: "8A",
      rollNumber: 1,
      age: 13,
      tenantId: "tenantB"
    },
    {
      name: "Kavya Trivedi",
      className: "7A",
      rollNumber: 2,
      age: 12,
      tenantId: "tenantB"
    }
  ],

  subjects: [
    { name: "Mathematics", className: "10A", tenantId: "tenantA" },
    { name: "Science", className: "10A", tenantId: "tenantA" },
    { name: "English", className: "10A", tenantId: "tenantA" },

    { name: "Mathematics", className: "8A", tenantId: "tenantB" },
    { name: "Science", className: "8A", tenantId: "tenantB" }
  ],

  marks: [
    // Tenant A
    {
      studentName: "Arjun Mehta",
      subject: "Mathematics",
      marksObtained: 92,
      examType: "Final",
      tenantId: "tenantA"
    },
    {
      studentName: "Riya Shah",
      subject: "Science",
      marksObtained: 85,
      examType: "Final",
      tenantId: "tenantA"
    },
    {
      studentName: "Kunal Agarwal",
      subject: "Mathematics",
      marksObtained: 67,
      examType: "Midterm",
      tenantId: "tenantA"
    },

    // Tenant B
    {
      studentName: "Dhruv Patel",
      subject: "Mathematics",
      marksObtained: 78,
      examType: "Final",
      tenantId: "tenantB"
    }
  ],

  notices: [
    {
      title: "Midterm Exam Schedule",
      description: "Midterm exams will begin from 10th August",
      date: "2025-08-01",
      tenantId: "tenantA"
    },
    {
      title: "Holiday Notice",
      description: "School closed for festival",
      date: "2025-09-05",
      tenantId: "tenantB"
    }
  ],

  complaints: [
    {
      studentName: "Arjun Mehta",
      message: "Issue with marks in Science",
      status: "Pending",
      tenantId: "tenantA"
    },
    {
      studentName: "Kavya Trivedi",
      message: "Transport delay issue",
      status: "Resolved",
      tenantId: "tenantB"
    }
  ]
};
