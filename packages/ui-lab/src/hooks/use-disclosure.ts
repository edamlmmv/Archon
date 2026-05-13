import { useCallback, useState } from 'react';

export interface UseDisclosureOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDialog: () => void;
  closeDialog: () => void;
  toggleDialog: () => void;
}

export function useDisclosure({
  open,
  defaultOpen = false,
  onOpenChange,
}: UseDisclosureOptions = {}): UseDisclosureResult {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean): void => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const openDialog = useCallback((): void => {
    setOpen(true);
  }, [setOpen]);
  const closeDialog = useCallback((): void => {
    setOpen(false);
  }, [setOpen]);
  const toggleDialog = useCallback((): void => {
    setOpen(!currentOpen);
  }, [currentOpen, setOpen]);

  return {
    open: currentOpen,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}
