const Footer = () => {
  return (
    <footer className="w-full bg-white text-black pt-8 pb-2 px-6 border-t border-[#e5e5e5] mt-48">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          <div>
            <img 
              src="/Linea_Jewelry_Inc-2.svg" 
              alt="Linea Jewelry Inc." 
              className="mb-4 h-6 w-auto"
            />
            <p className="text-sm font-light text-black/70 leading-relaxed max-w-md mb-6">
              Joias minimalistas feitas para o indivíduo moderno
            </p>
            
            <div className="space-y-2 text-sm font-light text-black/70">
              <div>
                <p className="font-normal text-black mb-1">Visite-nos</p>
                <p>Rua Oscar Freire, 123</p>
                <p>São Paulo, SP 01426-001</p>
              </div>
              <div>
                <p className="font-normal text-black mb-1 mt-3">Contato</p>
                <p>+55 (11) 3456-7890</p>
                <p>contato@lineajewelry.com.br</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-normal mb-4">Loja</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Novidades</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Anéis</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Brincos</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Pulseiras</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Colares</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-normal mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Guia de Tamanhos</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Cuidados com a Joia</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Trocas e Devoluções</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Envio</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-normal mb-4">Conecte-se</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Pinterest</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Newsletter</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] -mx-6 px-6 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-light text-black mb-1 md:mb-0">
            © 2024 Linea. Todos os direitos reservados. Template por{" "}
            <a href="https://www.liljeros.co" target="_blank" rel="noopener noreferrer" className="hover:text-black/70 transition-colors underline">
              Rickard Liljeros
            </a>
          </p>
          <div className="flex space-x-6">
            <a href="/privacy-policy" className="text-sm font-light text-black hover:text-black/70 transition-colors">
              Política de Privacidade
            </a>
            <a href="/terms-of-service" className="text-sm font-light text-black hover:text-black/70 transition-colors">
              Termos de Serviço
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
