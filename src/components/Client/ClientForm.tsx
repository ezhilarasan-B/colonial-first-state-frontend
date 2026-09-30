/**
 * Client Form Component (Add / Edit)
 * Supports client details and Staff assignment dropdown loading all available staff.
 * Stores selected StaffID against the Client record.
 * Supports integer IDs (1, 2, 3...)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  createClientThunk,
  updateClientThunk,
  selectClientById,
} from '../../api/client/clientSlice';
import { clientApi } from '../../api/client/clientApi';
import { staffApi } from '../../api/staff/staffApi';
import type { Staff } from '../../api/staff/staffTypes';
import type { ClientPayload, ClientFormErrors } from '../../api/client/clientTypes';
import { ROUTES } from '../../constants';
import { Input, Button, Spinner } from '../../package/UI';

export interface ClientFormProps {
  mode: 'add' | 'edit';
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  staffId: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  staffId: '',
};

export const ClientForm: React.FC<ClientFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const numId = id ? Number(id) : undefined;

  const cachedClient = useAppSelector(selectClientById(numId));
  const [loadingClient, setLoadingClient] = useState<boolean>(mode === 'edit' && !cachedClient);

  // Available staff list for assignment dropdown
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [loadingStaffList, setLoadingStaffList] = useState<boolean>(true);

  const [formData, setFormData] = useState<FormState>(() => {
    if (mode === 'edit' && cachedClient) {
      return {
        name: cachedClient.name,
        email: cachedClient.email,
        phone: cachedClient.phone,
        company: cachedClient.company,
        staffId: cachedClient.staffId.toString(),
      };
    }
    return INITIAL_FORM_STATE;
  });

  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load all available staff for the dropdown
  useEffect(() => {
    let isMounted = true;
    staffApi
      .getAllStaff()
      .then((staffList) => {
        if (isMounted) {
          setAvailableStaff(staffList);
        }
      })
      .catch((err) => {
        console.error('Failed to load staff list for assignment dropdown:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingStaffList(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // If in edit mode and client is not in cache, load directly
  useEffect(() => {
    if (mode === 'edit' && numId && !cachedClient) {
      clientApi
        .getClientById(numId)
        .then((client) => {
          setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            staffId: client.staffId.toString(),
          });
        })
        .catch((err) => {
          console.error('Failed to load client details:', err);
        })
        .finally(() => {
          setLoadingClient(false);
        });
    }
  }, [mode, numId, cachedClient]);

  const handleCancel = () => {
    navigate(ROUTES.CLIENT);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ClientPayload]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ClientFormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Client name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Client name must be at least 2 characters.';
    } else if (trimmedName.length > 150) {
      newErrors.name = 'Client name must not exceed 150 characters.';
    }

    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const trimmedPhone = formData.phone.trim();
    const phoneRegex = /^\d{10}$/;
    if (!trimmedPhone || !phoneRegex.test(trimmedPhone)) {
      newErrors.phone = 'Phone number must contain exactly 10 digits.';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required.';
    }

    const staffIdNum = Number(formData.staffId);
    if (!formData.staffId || isNaN(staffIdNum) || staffIdNum <= 0) {
      newErrors.staffId = 'Please assign a staff member to this client.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: ClientPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      staffId: Number(formData.staffId),
    };

    setIsSubmitting(true);

    try {
      if (mode === 'add') {
        await dispatch(createClientThunk(payload)).unwrap();
      } else if (mode === 'edit' && numId !== undefined) {
        await dispatch(updateClientThunk({ id: numId, payload })).unwrap();
      }

      navigate(ROUTES.CLIENT);
    } catch {
      // Error handled via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingClient) {
    return (
      <div className="client-form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <Spinner size="lg" label="Loading client details..." />
      </div>
    );
  }

  const isEditMode = mode === 'edit';
  const pageTitle = isEditMode ? 'Edit Client Record' : 'Register New Client';
  const pageSubtitle = isEditMode
    ? `Updating account details and staff assignment for ${formData.name || `Client #${numId}`} (ID: ${numId})`
    : 'Add a new client and assign them to an enterprise staff directory member.';

  return (
    <div className="client-form-page">
      <div className="client-form__header">
        <h1 className="client-form__title">{pageTitle}</h1>
        <p className="client-form__subtitle">{pageSubtitle}</p>
      </div>

      <div className="client-form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="client-form__grid">
            {/* Client Name */}
            <Input
              label="Client / Contact Name"
              name="name"
              type="text"
              placeholder="e.g. Acme Global Corporation"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              disabled={isSubmitting}
            />

            {/* Company */}
            <Input
              label="Company Name"
              name="company"
              type="text"
              placeholder="e.g. Acme Corporation"
              value={formData.company}
              onChange={handleChange}
              error={errors.company}
              required
              disabled={isSubmitting}
            />

            {/* Email */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. contact@acmeglobal.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              disabled={isSubmitting}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              name="phone"
              type="text"
              placeholder="e.g. 0291234567 (10 digits)"
              maxLength={10}
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              disabled={isSubmitting}
            />

            {/* Assigned Staff Dropdown */}
            <div className="client-form__group" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="staffId" className="client-form__label">
                Assigned Staff Member <span className="client-form__required">*</span>
              </label>
              <div className="client-form__select-wrapper">
                <select
                  id="staffId"
                  name="staffId"
                  className={`client-form__select ${errors.staffId ? 'client-form__select--error' : ''}`}
                  value={formData.staffId}
                  onChange={handleChange}
                  disabled={isSubmitting || loadingStaffList}
                  required
                >
                  <option value="">
                    {loadingStaffList
                      ? 'Loading staff members...'
                      : '-- Select One Assigned Staff Member --'}
                  </option>
                  {availableStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} (Staff ID: {staff.id} | {staff.city}, {staff.state})
                    </option>
                  ))}
                </select>
              </div>
              {errors.staffId && (
                <span className="client-form__error" role="alert">
                  {errors.staffId}
                </span>
              )}
              <span className="client-form__help-text">
                Select exactly one staff member responsible for servicing this client account.
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="client-form__footer">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
