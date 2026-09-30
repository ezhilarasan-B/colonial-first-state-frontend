/**
 * Staff Form Component (Add / Edit)
 * Manages form state, validation, and dispatches create/update thunks.
 * Supports integer IDs (1, 2, 3...)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  createStaffThunk,
  updateStaffThunk,
  selectStaffById,
} from '../../api/staff/staffSlice';
import { staffApi } from '../../api/staff/staffApi';
import type { StaffPayload, StaffFormErrors } from '../../api/staff/staffTypes';
import { ROUTES } from '../../constants';
import { Input, Button, Spinner } from '../../package/UI';

export interface StaffFormProps {
  mode: 'add' | 'edit';
}

interface FormState {
  name: string;
  age: string;
  city: string;
  state: string;
  pincode: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: '',
  age: '',
  city: '',
  state: '',
  pincode: '',
};

export const StaffForm: React.FC<StaffFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const numId = id ? Number(id) : undefined;

  const cachedStaff = useAppSelector(selectStaffById(numId));
  const [loadingStaff, setLoadingStaff] = useState<boolean>(mode === 'edit' && !cachedStaff);

  const [formData, setFormData] = useState<FormState>(() => {
    if (mode === 'edit' && cachedStaff) {
      return {
        name: cachedStaff.name,
        age: cachedStaff.age.toString(),
        city: cachedStaff.city,
        state: cachedStaff.state,
        pincode: cachedStaff.pincode,
      };
    }
    return INITIAL_FORM_STATE;
  });
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If in edit mode and not in cache (e.g. browser refresh), fetch directly from API
  useEffect(() => {
    if (mode === 'edit' && numId && !cachedStaff) {
      staffApi
        .getStaffById(numId)
        .then((staff) => {
          setFormData({
            name: staff.name,
            age: staff.age.toString(),
            city: staff.city,
            state: staff.state,
            pincode: staff.pincode,
          });
        })
        .catch((err) => {
          console.error('Failed to fetch staff record:', err);
        })
        .finally(() => {
          setLoadingStaff(false);
        });
    }
  }, [mode, numId, cachedStaff]);

  const handleCancel = () => {
    navigate(ROUTES.STAFF);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof StaffPayload]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: StaffFormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters.';
    }

    const trimmedAge = formData.age.trim();
    if (!trimmedAge) {
      newErrors.age = 'Age is required.';
    } else {
      const ageNum = Number(trimmedAge);
      if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
        newErrors.age = 'Age must be an integer.';
      } else if (ageNum < 18 || ageNum > 100) {
        newErrors.age = 'Age must be between 18 and 100.';
      }
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    const trimmedPincode = formData.pincode.trim();
    if (!trimmedPincode) {
      newErrors.pincode = 'Pincode is required.';
    } else if (trimmedPincode.length < 4) {
      newErrors.pincode = 'Pincode must be at least 4 characters.';
    } else if (trimmedPincode.length > 10) {
      newErrors.pincode = 'Pincode must not exceed 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: StaffPayload = {
      name: formData.name.trim(),
      age: Number(formData.age.trim()),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
    };

    setIsSubmitting(true);

    try {
      if (mode === 'add') {
        await dispatch(createStaffThunk(payload)).unwrap();
      } else if (mode === 'edit' && numId !== undefined) {
        await dispatch(updateStaffThunk({ id: numId, payload })).unwrap();
      }

      navigate(ROUTES.STAFF);
    } catch {
      // Error handled via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStaff) {
    return (
      <div className="staff-form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <Spinner size="lg" label="Loading staff details..." />
      </div>
    );
  }

  const isEditMode = mode === 'edit';
  const pageTitle = isEditMode ? 'Edit Staff Member' : 'Add New Staff Member';
  const pageSubtitle = isEditMode
    ? `Updating directory profile for ${formData.name || `Staff #${numId}`} (ID: ${numId})`
    : 'Create a new staff directory record in the corporate system.';

  return (
    <div className="staff-form-page">
      <div className="staff-form__header">
        <h1 className="staff-form__title">{pageTitle}</h1>
        <p className="staff-form__subtitle">{pageSubtitle}</p>
      </div>

      <div className="staff-form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="staff-form__grid">
            {/* Full Name */}
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. Eleanor Vance"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              disabled={isSubmitting}
            />

            {/* Age */}
            <Input
              label="Age"
              name="age"
              type="number"
              min="18"
              max="100"
              placeholder="e.g. 32"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              required
              disabled={isSubmitting}
            />

            {/* City */}
            <Input
              label="City"
              name="city"
              type="text"
              placeholder="e.g. Sydney"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              required
              disabled={isSubmitting}
            />

            {/* State */}
            <Input
              label="State"
              name="state"
              type="text"
              placeholder="e.g. New South Wales"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              required
              disabled={isSubmitting}
            />

            {/* Pincode */}
            <Input
              label="Pincode"
              name="pincode"
              type="text"
              placeholder="e.g. 2000"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
          <div className="staff-form__footer">
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
              Save Staff
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
