import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useInstructorCredentials } from "../hooks/useInstructorCredentials";

export function CadastroInstrutor() {
  const navigate = useNavigate();
  const { registerUser } = useUserManagement();
  const { generateCredential, storeCredential } = useInstructorCredentials();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    institution: "",
    specialization: "",
    yearsExperience: "",
    credentialId: "",
    consent: {
      dataCollection: false,
      dataProcessing: false,
      termsAccepted: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.cpf.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
      newErrors.cpf = "CPF deve estar no formato: 000.000.000-00";
    }
    if (!formData.phone.match(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)) {
      newErrors.phone = "Telefone deve estar no formato: (00) 0000-0000";
    }
    if (!formData.institution.trim()) newErrors.institution = "Instituição é obrigatória";
    if (!formData.specialization.trim()) newErrors.specialization = "Especialização é obrigatória";
    if (!formData.yearsExperience || formData.yearsExperience < 0) {
      newErrors.yearsExperience = "Anos de experiência inválido";
    }
    if (!formData.credentialId.trim()) {
      newErrors.credentialId = "Credencial de instrutor é obrigatória";
    }
    if (!formData.consent.dataCollection) {
      newErrors.consent =
        "Você deve consentir com a coleta de dados conforme LGPD";
    }
    if (!formData.consent.dataProcessing) {
      newErrors.consent =
        "Você deve consentir com o processamento de dados";
    }
    if (!formData.consent.termsAccepted) {
      newErrors.terms = "Você deve aceitar os termos de serviço";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Máscara para CPF
    if (name === "cpf") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 11) {
        const formatted =
          cleaned.slice(0, 3) +
          (cleaned.length > 3 ? "." : "") +
          cleaned.slice(3, 6) +
          (cleaned.length > 6 ? "." : "") +
          cleaned.slice(6, 9) +
          (cleaned.length > 9 ? "-" : "") +
          cleaned.slice(9, 11);
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    // Máscara para Telefone
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 11) {
        const formatted =
          cleaned.slice(0, 2) && cleaned.length >= 2 ? `(${cleaned.slice(0, 2)})` : "" +
          cleaned.slice(2, 7) && cleaned.length >= 7
            ? ` ${cleaned.slice(2, 7)}`
            : "" +
          cleaned.slice(7, 11) && cleaned.length >= 7 ? `-${cleaned.slice(7, 11)}` : "";
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsentChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      consent: { ...prev.consent, [name]: checked },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Gera credencial única e a armazena
    const credentialId = generateCredential();
    storeCredential(Date.now(), credentialId); // Usa timestamp temporário, será atualizado após registro

    const newUser = registerUser({
      ...formData,
      role: "instrutor",
      credentialId: credentialId,
    });

    // Atualiza a credencial com o ID do usuário real
    const credentials = JSON.parse(localStorage.getItem("enat_instructor_credentials") || "{}");
    if (credentials[credentialId]) {
      credentials[credentialId].instructorId = newUser.id;
      localStorage.setItem("enat_instructor_credentials", JSON.stringify(credentials));
    }

    setSubmitted(true);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 pt-20">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-4">
            Bem-vindo à plataforma ENAT HSI, {formData.name}!
          </p>
          <p className="text-sm text-gray-500">Redirecionando para a página inicial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 pt-24">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastro de Instrutor</h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para se registrar na plataforma ENAT HSI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Informações Pessoais</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="João Silva"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="joao@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.cpf ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="000.000.000-00"
                    maxLength="14"
                  />
                  {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Informações Profissionais</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instituição *</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.institution ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Universidade/Escola"
                />
                {errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialização *</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.specialization ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="ex: Psicopedagogia, Educação Especial"
                />
                {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência *</label>
                <input
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.yearsExperience ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.yearsExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsExperience}</p>}
              </div>
            </div>
          </div>

          {/* Credencial de Instrutor */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🔐 Credencial de Instrutor</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-900 mb-4">
                Sua credencial de instrutor é um identificador único que permite que alunos se vinculem a você. <strong>Guarde-a com segurança.</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credencial Gerada *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="credentialId"
                    value={formData.credentialId}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-2 border rounded-lg bg-amber-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.credentialId ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Será gerada automaticamente"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newCredential = generateCredential();
                      setFormData((prev) => ({ ...prev, credentialId: newCredential }));
                    }}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition whitespace-nowrap"
                  >
                    Gerar Credencial
                  </button>
                </div>
                {errors.credentialId && <p className="text-red-500 text-sm mt-1">{errors.credentialId}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  ℹ️ Compartilhe apenas esta credencial com seus alunos para que se vinculem a você.
                </p>
              </div>
            </div>
          </div>

          {/* Conformidade LGPD */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🔒 Conformidade com LGPD</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-3">
                De acordo com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, você autoriza o ENAT HSI a:
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="dataCollection"
                    checked={formData.consent.dataCollection}
                    onChange={handleConsentChange}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>Coletar dados pessoais</strong> necessários para administração da plataforma e geração de relatórios educacionais.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="dataProcessing"
                    checked={formData.consent.dataProcessing}
                    onChange={handleConsentChange}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>Processar dados</strong> para análise de desempenho, geração de relatórios e melhorias na plataforma.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.consent.termsAccepted}
                    onChange={handleConsentChange}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>Aceitar Termos de Serviço e Política de Privacidade</strong> do ENAT HSI.
                  </span>
                </label>
              </div>

              {errors.consent && <p className="text-red-500 text-sm mt-3">{errors.consent}</p>}
              {errors.terms && <p className="text-red-500 text-sm mt-3">{errors.terms}</p>}
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              ℹ️ Seus dados são armazenados de forma segura e criptografada. Você tem direito de acessar, corrigir ou solicitar exclusão de seus dados a qualquer momento.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              ✓ Registrar como Instrutor
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
