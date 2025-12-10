import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";

export function CadastroAluno() {
  const navigate = useNavigate();
  const { registerUser } = useUserManagement();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    cpf: "",
    phone: "",
    school: "",
    grade: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    parentConsent: false,
    consent: {
      dataCollection: false,
      dataProcessing: false,
      parentAuthorization: false,
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
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Data de nascimento é obrigatória";
    if (!formData.cpf.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
      newErrors.cpf = "CPF deve estar no formato: 000.000.000-00";
    }
    if (!formData.phone.match(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)) {
      newErrors.phone = "Telefone deve estar no formato: (00) 0000-0000";
    }
    if (!formData.school.trim()) newErrors.school = "Escola é obrigatória";
    if (!formData.grade) newErrors.grade = "Série/Ano é obrigatório";
    if (!formData.parentName.trim()) newErrors.parentName = "Nome do responsável é obrigatório";
    if (!formData.parentEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.parentEmail = "Email do responsável inválido";
    }
    if (!formData.parentPhone.match(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)) {
      newErrors.parentPhone = "Telefone do responsável deve estar no formato: (00) 0000-0000";
    }

    if (!formData.consent.dataCollection) {
      newErrors.consent = "Você deve consentir com a coleta de dados conforme LGPD";
    }
    if (!formData.consent.dataProcessing) {
      newErrors.consent = "Você deve consentir com o processamento de dados";
    }
    if (!formData.consent.parentAuthorization) {
      newErrors.parentAuth = "É necessária a autorização do responsável";
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
    if (name === "phone" || name === "parentPhone") {
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
    if (name === "parentConsent") {
      setFormData((prev) => ({ ...prev, parentConsent: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        consent: { ...prev.consent, [name]: checked },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newUser = registerUser({
      name: formData.name,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      cpf: formData.cpf,
      phone: formData.phone,
      school: formData.school,
      grade: formData.grade,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
      consent: formData.consent,
      role: "aluno",
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 pt-20">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 pt-24">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastro de Aluno</h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para se registrar na plataforma ENAT HSI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Aluno */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">👤 Informações do Aluno</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="João Silva Santos"
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="joao@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                      errors.cpf ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="000.000.000-00"
                    maxLength="14"
                  />
                  {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="(00) 00000-0000"
                  maxLength="15"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Informações Escolares */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🎓 Informações Escolares</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola *</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.school ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nome da escola"
                />
                {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série/Ano *</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.grade ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione...</option>
                  <option value="1o_ano_ef">1º Ano (EF)</option>
                  <option value="2o_ano_ef">2º Ano (EF)</option>
                  <option value="3o_ano_ef">3º Ano (EF)</option>
                  <option value="4o_ano_ef">4º Ano (EF)</option>
                  <option value="5o_ano_ef">5º Ano (EF)</option>
                  <option value="6o_ano_ef">6º Ano (EF)</option>
                  <option value="7o_ano_ef">7º Ano (EF)</option>
                  <option value="8o_ano_ef">8º Ano (EF)</option>
                  <option value="9o_ano_ef">9º Ano (EF)</option>
                  <option value="1o_ano_em">1º Ano (EM)</option>
                  <option value="2o_ano_em">2º Ano (EM)</option>
                  <option value="3o_ano_em">3º Ano (EM)</option>
                </select>
                {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
              </div>
            </div>
          </div>

          {/* Informações do Responsável */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">👨‍👩‍👧 Responsável Legal</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.parentName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nome do responsável"
                />
                {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.parentEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="responsavel@example.com"
                />
                {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.parentPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="(00) 00000-0000"
                  maxLength="15"
                />
                {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
              </div>
            </div>
          </div>

          {/* Conformidade LGPD */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🔒 Conformidade com LGPD</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="dataCollection"
                  checked={formData.consent.dataCollection}
                  onChange={handleConsentChange}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Coletar dados pessoais</strong> do aluno necessários para administração da plataforma e geração de relatórios educacionais.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="dataProcessing"
                  checked={formData.consent.dataProcessing}
                  onChange={handleConsentChange}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Processar dados</strong> para análise de desempenho, geração de relatórios e melhorias na plataforma.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="parentAuthorization"
                  checked={formData.consent.parentAuthorization}
                  onChange={handleConsentChange}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Autorização do Responsável</strong>: O responsável autoriza a coleta e processamento de dados do aluno conforme LGPD.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.consent.termsAccepted}
                  onChange={handleConsentChange}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Aceitar Termos de Serviço e Política de Privacidade</strong> do ENAT HSI.
                </span>
              </label>

              {errors.consent && <p className="text-red-500 text-sm mt-3">{errors.consent}</p>}
              {errors.parentAuth && <p className="text-red-500 text-sm mt-3">{errors.parentAuth}</p>}
              {errors.terms && <p className="text-red-500 text-sm mt-3">{errors.terms}</p>}
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              ℹ️ <strong>Direitos LGPD:</strong> O aluno e seu responsável têm direito de acessar, corrigir ou solicitar exclusão de dados a qualquer momento. Contate-nos em privacy@enat.hsi para exercer esses direitos.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
            >
              ✓ Registrar como Aluno
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
