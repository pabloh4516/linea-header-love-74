
INSERT INTO public.categories (name, slug, description, sort_order, grid_layout)
VALUES
  ('Camisas Oficiais', 'camisas', 'Camisas oficiais da Seleção Brasileira para a Copa 2026', 100, 'standard'),
  ('Acessórios', 'acessorios', 'Bonés, canecas, chaveiros e acessórios temáticos do Brasil', 101, 'standard'),
  ('Bandeiras', 'bandeiras', 'Bandeiras do Brasil em todos os tamanhos para torcer com orgulho', 102, 'standard'),
  ('Colecionáveis', 'colecionaveis', 'Itens exclusivos para colecionadores da Copa do Mundo', 103, 'standard'),
  ('Edição Limitada', 'edicao-limitada', 'Produtos exclusivos com tiragem limitada — quando acabar, acabou', 104, 'featured'),
  ('Copa 2026', 'copa', 'Toda a coleção da Copa do Mundo 2026 em um só lugar', 99, 'editorial')
ON CONFLICT (slug) DO NOTHING;
