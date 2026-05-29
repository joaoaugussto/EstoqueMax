import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import EstoqueMax from "./EstoqueMax";
import LoginPage from "./LoginPage";
import Admin from "./pages/Admin";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Produtos from "./pages/dashboard/Produtos";
import ProdutoForm from "./pages/dashboard/ProdutoForm";
import ProdutoHistorico from "./pages/dashboard/ProdutoHistorico";
import ImportarProdutos from "./pages/dashboard/ImportarProdutos";
import Movimentacoes from "./pages/dashboard/Movimentacoes";
import Pedidos from "./pages/dashboard/Pedidos";
import Fornecedores from "./pages/dashboard/Fornecedores";
import Depositos from "./pages/dashboard/Depositos";
import Relatorios from "./pages/dashboard/Relatorios";
import Financeiro from "./pages/dashboard/Financeiro";
import Funcionarios from "./pages/dashboard/Funcionarios";
import Configuracoes from "./pages/dashboard/Configuracoes";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<EstoqueMax />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="produtos/novo" element={<ProdutoForm />} />
          <Route path="produtos/importar" element={<ImportarProdutos />} />
          <Route path="produtos/:id/editar" element={<ProdutoForm />} />
          <Route path="produtos/:id/historico" element={<ProdutoHistorico />} />
          <Route path="movimentacoes" element={<Movimentacoes />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="fornecedores" element={<Fornecedores />} />
          <Route path="depositos" element={<Depositos />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
