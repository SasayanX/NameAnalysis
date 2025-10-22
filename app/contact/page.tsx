import ContactForm from "@/components/contact-form"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">お問い合わせ</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          カナウ四柱推命に関するご質問、ご要望、技術的な問題など、
          お気軽にお問い合わせください。3営業日以内にご返信いたします。
        </p>
      </div>

      <ContactForm />
    </div>
  )
}
