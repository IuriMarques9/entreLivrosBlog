import NewsletterForm from "@/components/Footer/NewsletterForm";
import SuggestionForm from "@/components/Footer/SuggestionForm";

const Footer = () => {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] px-4 py-12 sm:px-6">
                <div className="grid gap-10 md:grid-cols-2">
                    <NewsletterForm />
                    <SuggestionForm />
                </div>
            </div>

            <div className="border-t border-border py-6 text-center">
                <p className="font-body text-sm text-muted-foreground">
                Entre Livros {new Date().getFullYear()} — Fornecido por <a href="https://reddunesolutions.pt/" className="underline hover:text-red-600">RedDune Solutions</a>
                </p>
            </div>
        </footer>
    );
};


export default Footer;
