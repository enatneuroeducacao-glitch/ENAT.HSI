export function generateCredentialId() {
  // Gera credencial no formato: ENAT-INST-AAAA-XXXXX
  const year = new Date().getFullYear();
  const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ENAT-INST-${year}-${randomCode}`;
}

export function validateCredentialFormat(credential) {
  // Valida formato da credencial
  return /^ENAT-INST-\d{4}-[A-Z0-9]{5}$/.test(credential);
}

export function useInstructorCredentials() {
  const generateCredential = () => {
    return generateCredentialId();
  };

  const storeCredential = (userId, credentialId) => {
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    credentials[credentialId] = {
      instructorId: userId,
      createdAt: new Date().toISOString(),
      used: false,
      linkedStudents: [],
    };
    localStorage.setItem("enat_instructor_credentials", JSON.stringify(credentials));
    return credentialId;
  };

  const validateCredential = (credentialId) => {
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    return credentials[credentialId] ? true : false;
  };

  const getCredentialInfo = (credentialId) => {
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    return credentials[credentialId] || null;
  };

  const getInstructorByCredential = (credentialId) => {
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    const credential = credentials[credentialId];
    if (!credential) return null;

    const users = JSON.parse(localStorage.getItem("enat_users") || "[]");
    return users.find((user) => user.id === credential.instructorId) || null;
  };

  const linkStudentToInstructor = (credentialId, studentId, instructorId) => {
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    const credential = credentials[credentialId];

    if (!credential) {
      throw new Error("Credencial inválida");
    }

    if (credential.instructorId !== instructorId) {
      throw new Error("Credencial não pertence a este instrutor");
    }

    if (!credential.linkedStudents) {
      credential.linkedStudents = [];
    }

    if (!credential.linkedStudents.includes(studentId)) {
      credential.linkedStudents.push(studentId);
    }

    credentials[credentialId] = credential;
    localStorage.setItem("enat_instructor_credentials", JSON.stringify(credentials));

    // Atualiza usuário com informações de vínculo
    const users = JSON.parse(localStorage.getItem("enat_users") || "[]");
    const studentIndex = users.findIndex((u) => u.id === studentId);
    if (studentIndex !== -1) {
      users[studentIndex].linkedInstructorId = instructorId;
      users[studentIndex].linkedCredentialId = credentialId;
      localStorage.setItem("enat_users", JSON.stringify(users));
    }

    return true;
  };

  const getStudentInstructor = (studentId) => {
    const users = JSON.parse(localStorage.getItem("enat_users") || "[]");
    const student = users.find((u) => u.id === studentId);
    if (!student || !student.linkedInstructorId) return null;

    return users.find((u) => u.id === student.linkedInstructorId) || null;
  };

  const getInstructorStudents = (instructorId) => {
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    const users = JSON.parse(localStorage.getItem("enat_users") || "[]");

    const linkedStudents = [];
    Object.values(credentials).forEach((credential) => {
      if (credential.instructorId === instructorId) {
        credential.linkedStudents.forEach((studentId) => {
          const student = users.find((u) => u.id === studentId);
          if (student) linkedStudents.push(student);
        });
      }
    });

    return linkedStudents;
  };

  return {
    generateCredential,
    storeCredential,
    validateCredential,
    getCredentialInfo,
    getInstructorByCredential,
    linkStudentToInstructor,
    getStudentInstructor,
    getInstructorStudents,
  };
}
