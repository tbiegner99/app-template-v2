import { Routes, Route, BrowserRouter, Outlet, Navigate } from 'react-router-dom';
import * as reactRouterDom from 'react-router-dom';
import Home from './pages/Home';
import ManageUsers from './pages/ManageUsers';
import ChangePassword from './pages/ChangePassword';
import Logout from './pages/Logout';
import { DashboardAuthenticationWrapper } from './DashboardAuthenticationWrapper';
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import { EmailPasswordPreBuiltUI } from './config/supertokens';
import { H1 } from '@__SLUG__/components';

function AppRoutes() {
  return (
    <BrowserRouter basename="/__SLUG__/control-center">
      <Routes>
        {/* SuperTokens pre-built UI routes for /auth/* */}
        {getSuperTokensRoutesForReactRouterDom(
          reactRouterDom,
          [EmailPasswordPreBuiltUI],
          '/__SLUG__/control-center'
        )}

        {/* Logout */}
        <Route path="/auth/logout" element={<Logout />} />

        {/* Protected routes */}
        <Route
          path="/secure"
          element={
            <DashboardAuthenticationWrapper>
              <Outlet />
            </DashboardAuthenticationWrapper>
          }
        >
          <Route path="dashboard" element={<Home />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="add-user" element={<ManageUsers />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="client/:clientId">
            <Route path="" element={<Home />} />
            <Route path="settings" element={<div>Client Settings Page</div>} />
            <Route path="site/:siteId">
              <Route path="" element={<Home />} />
              <Route path="settings" element={<div>Site Settings Page</div>} />
            </Route>
          </Route>
        </Route>
        <Route path="/visitor/:token" element={<H1>Visitor Access Page</H1>}></Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/secure/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
