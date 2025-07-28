import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  message: string;
}

export default function ConfirmationModal({
  show,
  onClose,
  onConfirm,
  isLoading,
  title,
  message
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {t('dashboard.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner as="span" size="sm" animation="border" role="status" />
              <span className="ms-2">{t('common.deleting')}</span>
            </>
          ) : (
            t('dashboard.delete')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}