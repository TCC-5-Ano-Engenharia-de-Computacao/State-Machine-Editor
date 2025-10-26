# State Machine Editor - Guia de Uso

## Visão Geral

Este é um editor gráfico web para editar state machines em XML do Unity. O editor oferece uma interface híbrida com visualização de grafo e painéis de edição de propriedades.

## Funcionalidades Principais

### 1. Carregar e Exportar XML

- **Carregar XML**: Clique no botão "Load XML" na toolbar e selecione seu arquivo `.xml`
- **Exportar XML**: Clique no botão "Export XML" para baixar o arquivo editado
- Um arquivo de exemplo está incluído: `example_statemachine.xml`

### 2. Visualização de Grafo

- **Área principal**: Mostra todos os estados como nós conectados por transições
- **Estado inicial**: Indicado com um círculo verde
- **Estado selecionado**: Destacado com borda azul
- **Navegação**: 
  - Zoom: Scroll do mouse ou controles no canto inferior esquerdo
  - Pan: Clique e arraste no fundo
  - Mover nós: Clique e arraste os estados
- **Criar transição**: Arraste da borda inferior de um estado para a borda superior de outro

### 3. Criar Novo Estado

1. Clique no botão "New State" na toolbar
2. Digite um ID único para o estado
3. Clique em "Create"

### 4. Editar Propriedades do Estado (Aba Properties)

Selecione um estado no grafo para editar suas propriedades:

- **State ID**: Clique no ID para editar
- **Set as Initial**: Define o estado como inicial
- **Delete State**: Remove o estado e todas as transições relacionadas
- **Eventos**: Use as abas para editar ações em cada evento:
  - **BeforeEnter**: Executado antes de entrar no estado
  - **OnEnter**: Executado ao entrar no estado
  - **OnStay**: Executado enquanto permanece no estado
  - **OnLeave**: Executado ao sair do estado

#### Editar Ações

- **Adicionar**: Clique em "Add Action", digite o nome do tipo (ex: `PlayAnimationClipAction`)
- **Editar**: Clique no ícone de lápis
  - Edite o nome do tipo da ação
  - Adicione/edite/remova atributos (pares chave-valor)
  - Pressione Enter para adicionar novo atributo
- **Deletar**: Clique no ícone de lixeira
- **Reordenar**: Use o ícone de grip para arrastar (ordem importa!)

### 5. Editar Transições (Aba Transitions)

#### Transições de Saída (Outgoing)

- **Adicionar transição**: Selecione o estado destino no dropdown e clique em "+"
- **Selecionar transição**: Clique em uma transição na lista à esquerda
- **Editar transição selecionada**:
  - **Target State**: Altere o estado destino
  - **Conditions**: Condições que devem ser satisfeitas (AND lógico)
    - Adicione condições como `CheckTieCondition`, `BufferedInputCondition`, etc.
    - Edite atributos de cada condição
  - **Success Actions**: Ações executadas quando a transição é bem-sucedida
  - **Failure Actions**: Ações executadas quando a transição falha
- **Deletar transição**: Clique no ícone de lixeira na lista

#### Transições de Entrada (Incoming) - Edição Reversa

Esta é uma funcionalidade especial que permite definir "quais estados devem poder transicionar para este estado":

1. Selecione a aba "Incoming"
2. Marque os checkboxes dos estados que devem poder transicionar para o estado atual
3. O sistema automaticamente adiciona/remove transições nos estados de origem
4. Você pode ver quantas transições cada estado tem para o estado atual

**Exemplo de uso**: Se você está editando o estado "Idle" e quer que os estados "Jump" e "Attack" possam transicionar para "Idle", basta marcar os checkboxes de "Jump" e "Attack". O editor automaticamente criará transições nesses estados apontando para "Idle".

### 6. Validação (Aba Validation)

O editor valida automaticamente sua state machine e mostra:

- **Erros** (vermelho): Problemas críticos que devem ser corrigidos
  - Estado inicial não definido ou inexistente
  - IDs de estado duplicados ou vazios
  - Transições para estados inexistentes
  - Ações/condições com nomes vazios
  
- **Warnings** (amarelo): Avisos que podem ser intencionais
  - Estados sem transições de saída (estados terminais)
  - Estados inalcançáveis (sem transições de entrada)
  - Transições sem condições (sempre disparam)

Clique em um erro/warning para selecionar o estado relacionado.

## Estrutura XML

O editor mantém a estrutura XML compatível com seu parser do Unity:

```xml
<StateMachine initialState="Idle">
  <State id="Idle">
    <BeforeEnter>
      <SetColliderAction colliderName="stand"/>
    </BeforeEnter>
    <OnEnter>...</OnEnter>
    <OnStay>...</OnStay>
    <OnLeave>...</OnLeave>
    <Transitions>
      <Transition to="Jump">
        <Conditions>
          <BufferedInputCondition inputName="jump"/>
        </Conditions>
        <SuccessActions>
          <ClearHitBufferAction/>
        </SuccessActions>
      </Transition>
    </Transitions>
  </State>
</StateMachine>
```

## Dicas de Uso

1. **Ordem das transições importa**: Use a funcionalidade de reordenar para manter a ordem correta (como mencionado nos comentários do seu XML original)

2. **Validação contínua**: Sempre verifique a aba Validation antes de exportar

3. **Edição reversa é poderosa**: Use a aba Incoming para rapidamente configurar múltiplos estados que devem transicionar para um estado central (como "Idle")

4. **Atributos dinâmicos**: Todos os atributos de ações e condições são completamente dinâmicos - você pode adicionar qualquer par chave-valor que seu parser do Unity reconheça

5. **Backup**: Sempre mantenha backups do seu XML original antes de fazer grandes mudanças

## Atalhos de Teclado

- **Enter**: Confirmar edição/adicionar item
- **Escape**: Cancelar edição
- **Click no fundo**: Desselecionar estado

## Exemplo de Fluxo de Trabalho

1. Carregue seu XML existente com "Load XML"
2. Visualize a estrutura no grafo
3. Selecione um estado para editar
4. Adicione/edite ações nos eventos (aba Properties)
5. Configure transições de saída (aba Transitions > Outgoing)
6. Use edição reversa para definir estados que devem chegar aqui (aba Transitions > Incoming)
7. Verifique erros (aba Validation)
8. Exporte o XML editado com "Export XML"

## Suporte

Para questões sobre a estrutura XML específica do seu projeto Unity, consulte a documentação do seu parser.

