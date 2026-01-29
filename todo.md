# Barbearia Vila Nova - TODO

## Banco de Dados
- [x] Criar schema para tabela de barbeiros com autenticação por senha
- [x] Criar schema para tabela de serviços
- [x] Criar schema para tabela de agendamentos
- [x] Executar migrações do banco de dados
- [x] Popular banco com dados iniciais (barbeiros e serviços)

## Backend (tRPC)
- [x] Implementar rotas para autenticação de barbeiros (login com senha)
- [x] Implementar rotas para listar barbeiros
- [x] Implementar rotas para listar serviços
- [x] Implementar rotas para criar agendamento
- [x] Implementar rotas para listar agendamentos do cliente
- [x] Implementar rotas para listar agendamentos do barbeiro (filtrado)

## Frontend - Autenticação
- [x] Sistema de login OAuth para clientes (já integrado com Manus)
- [x] Criar página de login para barbeiros com senha
- [x] Implementar proteção de rotas para clientes e barbeiros

## Frontend - Páginas
- [x] Página inicial com hero, barbeiros, serviços e informações
- [x] Formulário de agendamento
- [x] Página de confirmação de agendamento
- [x] Página "Meus Agendamentos" para clientes
- [x] Painel do barbeiro com agendamentos filtrados

## Design
- [x] Configurar tema escuro e dourado no Tailwind
- [x] Garantir responsividade mobile
- [x] Adicionar imagens e ícones apropriados

## Testes
- [x] Criar testes para autenticação de barbeiros
- [x] Criar testes para criação de agendamentos
- [x] Criar testes para listagem de agendamentos

## Finalização
- [x] Executar todos os testes
- [x] Verificar responsividade em diferentes dispositivos
- [x] Criar checkpoint final

## Melhorias Solicitadas
- [x] Debugar e corrigir autenticação de barbeiros
- [x] Gerar/obter imagens profissionais de barbearia
- [x] Adicionar imagem hero no topo da página
- [x] Melhorar design visual geral do site
- [x] Estilizar componentes com melhor visual
- [x] Adicionar mais detalhes e efeitos visuais
- [x] Corrigir bug de login infinito dos barbeiros (usar localStorage)

## Bug Reportado - Agendamentos por Barbeiro
- [x] Corrigir filtro de agendamentos para mostrar apenas para o barbeiro específico
- [x] Garantir que agendamentos apareçam corretamente para cliente e barbeiro

## Bug Reportado - Erro 404 na Confirmação
- [x] Corrigir erro 404 na rota /agendamento-confirmado

## Novas Funcionalidades Solicitadas
- [x] Implementar cancelamento de agendamentos para clientes
- [x] Mostrar status de cancelamento para barbeiros
- [ ] Enviar email de confirmação quando agendamento é criado
- [ ] Enviar email de cancelamento quando agendamento é cancelado
- [x] Exibir cortes do dia no painel do barbeiro
- [x] Implementar filtro por data no painel do barbeiro
- [x] Remover agendamentos expirados (passados) da lista

## Funcionalidade de Finalização de Cortes
- [x] Adicionar campo para rastrear no-shows na tabela de usuários
- [x] Criar rotas tRPC para finalizar corte e registrar no-show
- [x] Implementar botões no painel do barbeiro
- [x] Enviar email ao cliente quando não comparece
- [x] Rastrear número de faltas do cliente

## Bugs Reportados - Prioridade Alta
- [x] Corrigir conflito de horários - permitir dois agendamentos no mesmo dia/hora/barbeiro
- [x] Corrigir problema de timezone - data está adiantando um dia
- [x] Analisar site em geral para outras brechas
